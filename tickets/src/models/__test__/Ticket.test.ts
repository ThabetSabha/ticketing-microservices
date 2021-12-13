import { createTestTicket, getTicketForTest } from "../../test/helpers";

it("implements optimistic concurrency control", async () => {
  // Create an instance of a ticket
  const ticket = await createTestTicket({
    title: "concert",
    price: 5,
    userId: "123",
  });

  // fetch the ticket twice
  const firstInstance = await getTicketForTest(ticket.id);
  const secondInstance = await getTicketForTest(ticket.id);

  // make two separate changes to the tickets we fetched
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  // save the first fetched ticket
  await firstInstance!.save();

  // save the second fetched ticket and expect an error
  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }

  throw new Error("Should not reach this point");
});

it("increments the version number on multiple saves", async () => {
  // Create an instance of a ticket
  const ticket = await createTestTicket({
    title: "concert",
    price: 5,
    userId: "123",
  });

  for (let i = 0; i < 3; i++) {
    expect(ticket.version).toEqual(i);
    await ticket.save();
  }
});
