// This is a duplicate of the Engageform's IEmbedSettings. For reasons beyond me, Liveevent doesn't use the parent
// library as a dependency.
module API {
  export interface IEmbedSettings {
    allowScrolling: boolean;
    width: string;
    height: string;
  }
}
