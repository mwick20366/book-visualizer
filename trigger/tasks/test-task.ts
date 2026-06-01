import { task } from "@trigger.dev/sdk";

export const testTask = task({
  id: "test-task",

  run: async (payload: { message: string }) => {
    console.log("TASK RUNNING");
    console.log(payload);

    return {
      success: true,
      echoedMessage: payload.message,
    };
  },
});