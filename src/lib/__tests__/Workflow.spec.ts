import IWorkflow from "../IWorkflow";
import Workflow from "../Workflow";

describe("Workflow", () => {
    it("instantiates a workflow object", () => {
        const testWorkflow: IWorkflow = new Workflow("test", null, null, null);
        expect(testWorkflow).toBeInstanceOf(Workflow);
    });
});
