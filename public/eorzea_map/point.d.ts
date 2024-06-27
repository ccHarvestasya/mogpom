declare module '*/point.json' {
  interface PointJson {
    patch: number;
    mapId: number;
    id: number;
    sizeX: number;
    sizeY: number;
    name: string;
    nameJp: string;
  }
  const value: PointJson[];
  export = value;
}
