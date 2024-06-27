declare module '*/map.json' {
  interface MapJson {
    patch: number;
    id: number;
    sizeX: number;
    sizeY: number;
    name: string;
    nameJp: string;
  }
  const value: MapJson[];
  export = value;
}
