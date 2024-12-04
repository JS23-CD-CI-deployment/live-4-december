const express = require("express");
const app = express();
const db = require("./db");

app.use(express.json());

// Hämta alla evenemang
app.get("/events", async (req, res) => {
  try {
    const events = await db.find({});

    const sortedEvents = events.sort(function (a, b) {
      if (a.artist < b.artist) {
        return -1;
      }
      if (a.artist > b.artist) {
        return 1;
      }
      return 0;
    });

    res.json(sortedEvents);
  } catch (err) {
    res.status(500).send("Fel vid hämtning av evenemang");
  }
});

// Beställ biljetter för ett evenemang
app.post("/orders", async (req, res) => {
  const { eventId, ticketCount } = req.body;

  if (!eventId || !ticketCount || ticketCount <= 0) {
    return res.status(400).send("Ogiltig beställning");
  }

  try {
    const event = await db.findOne({ id: eventId });

    if (!event) {
      return res.status(404).send("Evenemanget finns inte");
    }

    if (event.availableTickets < ticketCount) {
      return res.status(400).send("Inte tillräckligt med biljetter kvar");
    }

    // Uppdatera tillgängliga biljetter
    event.availableTickets = event.availableTickets - ticketCount;
    try {
      await db.update({ id: eventId }, event);
    } catch (error) {
      console.log("Error", error);
    }

    res.json({
      event,
      ticketsOrdered: ticketCount,
      ticketNumbers: Array.from(
        { length: ticketCount },
        (_, i) => `TICKET-${Date.now()}-${i + 1}`
      ),
    });
  } catch (err) {
    res.status(500).send("Fel vid uppdatering av evenemanget");
  }
});

app.listen(8000, () => {
  console.log("Server started");
});

module.exports = app;
