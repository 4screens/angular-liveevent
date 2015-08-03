module Page {
  export interface IPageSent {
    selectedCaseId: string;
    correctCaseId: string;
    selectedValue: number;
    result: number;
    results: {
      [index: string]: number
    }
    inputs: {
      _id: string;
      value: string;
    }[]
  }
}
