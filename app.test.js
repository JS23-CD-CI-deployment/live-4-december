const app = require("./app");
const request = require("supertest");
let db;

beforeAll(async () => {
  db = require("./db.js");

  const mockEvents = [
    {
      id: 1,
      artist: "Lasse-Stefans",
      date: "21 MAR",
      arena: "Kjell Härnqvistsalen",
      time: "19.00 - 21.00",
      price: "350 sek",
      availableTickets: 50,
    },
    {
      id: 2,
      artist: "Pelle trubadur",
      date: "29 MAR",
      arena: "Pubelipub",
      time: "22.00 - 00.00",
      price: "110 sek",
      availableTickets: 1,
    },
    {
      id: 3,
      artist: "Kajsas kör",
      date: "10 APR",
      arena: "Götaplatsen",
      time: "15.00 - 16.00",
      price: "99 sek",
      availableTickets: 50,
    },
    {
      id: 4,
      artist: "Klubb Untz",
      date: "17 APR",
      arena: "Din favoritkällare",
      time: "22.00 - du tröttnar",
      price: "150 sek",
      availableTickets: 50,
    },
  ];

  await db.insert(mockEvents);
});

describe("GET /events", () => {
  it("should return a list of events", async () => {
    const response = await request(app).get("/events");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(4); // Det ska finnas fyra evenemang

    expect(response.body[0].artist).toBe("Kajsas kör");
    expect(response.body[0].arena).toBe("Götaplatsen");
    expect(response.body[0].price).toBe("99 sek");
  });
});

describe("POST /orders", () => {
  it("should be possible to order some tickets to a event", async () => {
    const orderBody = {
      eventId: 1,
      ticketCount: 2,
    };

    const response = await request(app).post("/orders").send(orderBody);

    const event = await db.findOne({ id: orderBody.eventId });

    expect(event.availableTickets).toBe(48);
    expect(response.status).toBe(200);
    expect(response.body.ticketNumbers).toHaveLength(2); // Kontrollera att vi har två biljettnummer
    expect(response.body.event.artist).toBe("Lasse-Stefans");
  });

  it("should return an error if there is not enough tickets", async () => {
    const orderBody = {
      eventId: 2,
      ticketCount: 2,
    };

    const response = await request(app).post("/orders").send(orderBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe("Inte tillräckligt med biljetter kvar");
  });

  it("should return an error if the event does not exist", async () => {
    const orderBody = {
      eventId: 999,
      ticketCount: 1,
    };

    const response = await request(app).post("/orders").send(orderBody);

    expect(response.status).toBe(404);
    expect(response.text).toBe("Evenemanget finns inte");
  });
});
