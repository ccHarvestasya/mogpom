'use client';

import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useLayoutEffect, useState } from 'react';
import './eorzeaMap.css';
import imageAetheryte from '/public/eorzea_map/aetheryte.png';
import mapJson from '/public/eorzea_map/map.json';
import patchJson from '/public/eorzea_map/patch.json';
import pointJson from '/public/eorzea_map/point.json';

export default function EorzeaMap() {
  const [layoutLoad, setLayoutLoad] = useState(false);
  const [open, setOpen] = useState(false);
  const [map, setMap] = useState<L.Map>();
  const [tileLayer, setTileLayer] = useState<L.TileLayer>();
  const [patch, setPatch] = useState(3);
  const [selectedMapJson, setSelectedMapJson] = useState(mapJson);
  const [mapSize, setMapSize] = useState(409);
  const [mapMakers, setMapMakers] = useState<L.Marker[]>();

  useLayoutEffect(() => {
    return setLayoutLoad(true); // マップの再初期化を防ぐ
  }, [layoutLoad]);

  /**
   * 初回
   */
  useEffect(() => {
    if (!layoutLoad) return; // マップの再初期化を防ぐ
    console.log('useEffect[layoutLoad] - start');

    // パッチ選択コンボボックス初期値セット
    const lastIndex = patchJson.length - 1;
    const p = patchJson[lastIndex].patch;
    setPatch(p);

    // 地図
    const m = initMap();
    const tl = drawMap(m, tileLayer, p);
    setMap(m);
    setTileLayer(tl);

    console.log('useEffect[layoutLoad] - end');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutLoad]);

  /**
   * パッチ切り替え
   */
  useEffect(() => {
    if (!layoutLoad) return; // 再初期化を防ぐ
    console.log('useEffect[patch] - start');

    // マップ選択ボタン
    const selectedMapJson = mapJson.filter((mapJson) => {
      if (mapJson.patch === patch) return true;
      return false;
    });
    console.log(selectedMapJson);
    setSelectedMapJson(selectedMapJson);

    // 地図
    const tl = drawMap(map, tileLayer, patch);
    setTileLayer(tl);

    // マーカー
    const drawMapMakers = drawMaker(mapMakers, map!, patch, 1, mapSize);
    setMapMakers(drawMapMakers);

    console.log('useEffect[patch] - end');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patch]);

  const selectMap = (id: number) => {
    // 地図
    const tl = drawMap(map, tileLayer, patch, id);
    setTileLayer(tl);
    // 地図サイズ
    const selectedMapJson = mapJson.filter((mapJson) => {
      if (mapJson.patch === patch && mapJson.id === id) return true;
      return false;
    });
    if (selectedMapJson.length === 1) {
      setMapSize(selectedMapJson[0].sizeX);
    }
    // マーカー
    const drawMapMakers = drawMaker(mapMakers, map!, patch, id, mapSize);
    setMapMakers(drawMapMakers);
  };

  return (
    <>
      <div className="p-1">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[180px] justify-between"
            >
              {patch
                ? patchJson.find((patchJson) => patchJson.patch === patch)?.name
                : 'パッチ選択する...'}
              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[180px] p-0">
            <Command>
              <CommandList>
                <CommandGroup>
                  {patchJson.map((patchJson) => (
                    <CommandItem
                      key={patchJson.patch}
                      value={patchJson.patch.toString()}
                      onSelect={(currentValue) => {
                        setPatch(Number(currentValue) === patch ? patch : Number(currentValue));
                        setOpen(false);
                      }}
                    >
                      {patchJson.name}
                      <CheckIcon
                        className={cn(
                          'ml-auto h-4 w-4',
                          patch === patchJson.patch ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="map-selector p-0">
        {selectedMapJson.map((mapJson) => (
          <Button className="m-1" key={mapJson.id} onClick={() => selectMap(mapJson.id)}>
            {mapJson.name}
          </Button>
        ))}
      </div>

      <div className="leaflet-container">
        <div id="map"></div>
      </div>
    </>
  );
}

const initMap = () => {
  const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: 0,
    maxZoom: 3,
    zoomControl: false,
    zoomSnap: 0.01,
  });

  return map;
};

const drawMap = (
  map: L.Map | undefined,
  tLayer: L.TileLayer | undefined,
  patch: number,
  mapId = 1
): L.TileLayer | undefined => {
  if (map === undefined) return undefined;
  if (tLayer !== undefined) tLayer.remove();

  // 404エラー防止
  const mapBounds = new L.LatLngBounds(
    map.unproject([0, 2048], map.getMaxZoom()),
    map.unproject([2048, 0], map.getMaxZoom())
  );

  // レイヤー
  const strPatch = String(patch).padStart(2, '0');
  const tl = L.tileLayer(`eorzea_map/p${strPatch}_${mapId}/{z}/{x}/{y}.jpg`, {
    attribution: '&copy; <a href="https://jp.finalfantasyxiv.com/">SQUARE ENIX</a>',
    bounds: mapBounds,
    noWrap: true,
  });
  tl.addTo(map);

  // 画面サイズからフィットする倍率を求める
  const zoom = Math.log2(map.getSize().x / 256);
  // 初期位置
  map.setView(L.latLng(-128, 128), zoom);

  return tl;
};

const drawMaker = (
  makers: L.Marker[] | undefined,
  map: L.Map,
  patch: number,
  mapId: number,
  mapSize: number
) => {
  if (makers !== undefined) {
    for (const maker of makers) {
      maker.remove();
    }
  }

  const newMakers = [];

  /** エーテライト */
  // エーテライトアイコン
  const aetheryteIcon = L.icon({
    iconUrl: imageAetheryte.src,
    iconSize: [35, 35],
    iconAnchor: [17.5, 17.5],
  });
  // 座標
  const aetherytePoints = pointJson.filter((pointJson) => {
    if (pointJson.patch === patch && pointJson.mapId === mapId && pointJson.type === 'E')
      return true;
    return false;
  });
  // マーカー
  console.log(aetherytePoints);
  for (const point of aetherytePoints) {
    const posX = 256 * ((point.posX - 10) / mapSize);
    const posY = 256 * ((point.posY - 10) / mapSize);
    const aetheryteMaker = L.marker(L.latLng(posY * -1, posX), {
      icon: aetheryteIcon,
    }).addTo(map);
    aetheryteMaker.bindPopup(point.name, { autoClose: true });
    newMakers.push(aetheryteMaker);
  }

  // 転送ポイントの座標
  const warpPoints = pointJson.filter((pointJson) => {
    if (pointJson.patch === patch && pointJson.mapId === mapId && pointJson.type === 'W')
      return true;
    return false;
  });

  return newMakers;
};
