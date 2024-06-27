declare module '*/patch.json' {
  interface PatchJson {
    patch: number;
    name: string;
    nameJp: string;
  }
  const value: PatchJson[];
  export = value;
}
