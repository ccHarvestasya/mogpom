declare module '*/point.json' {
  interface PointJson {
    patch: number;
    mapId: number;
    id: number;
    type: string;
    posX: number;
    posY: number;
    name: string;
    nameJp: string;
  }
  const value: PointJson[];
  export = value;
}
