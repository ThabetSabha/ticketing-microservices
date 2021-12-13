export const natsWrapper = {
  client: {
    publish: jest
      .fn()
      .mockImplementation(
        (subject: string, event: string, callback: () => void) => {
          callback();
        }
      ),
  },
};
