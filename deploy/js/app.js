document.addEventListener("DOMContentLoaded", () => {
  const roomsContainer = document.getElementById("roomsContainer");
  const addRoomBtn = document.getElementById("addRoomBtn");
  const removeRoomBtn = document.getElementById("removeRoomBtn");
  const copyQuoteBtn = document.getElementById("copyQuoteBtn");
  const preview = document.getElementById("quotePreview");

  let rooms = [];

  // Function to update quote when any input changes
  function handleInputChange() {
    renderQuote();
  }

  // Add event listeners for all hotel & stay details inputs
  const inputs = [
    "hotelName",
    "hotelStars",
    "dateInput",
    "nightsCount",
    "numAdults",
    "numChildren",
    "hotelPhotos",
    "locationLink",
    "tripAdvisorLink",
    "embedLinks",
    "showEur"
  ];

  inputs.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("input", handleInputChange);
      element.addEventListener("change", handleInputChange);
    }
  });

  function createRoomBlock(index) {
    const div = document.createElement("div");
    div.className = "room-block";
    const showEur = document.getElementById("showEur").checked;
    
    div.innerHTML = `
      <h3>Room ${index + 1}</h3>
      
      <div class="input-field">
        <span>Room Type</span>
        <input type="text" data-room="${index}" class="room-type" placeholder="e.g., Deluxe Room, King Bed" />
      </div>

      <div class="input-field">
        <span>Meal Plan</span>
        <select data-room="${index}" class="meal-plan">
          <option>Room Only</option>
          <option>Breakfast Included</option>
        </select>
      </div>

      <div class="input-field">
        <span>Refundability</span>
        <select data-room="${index}" class="refund">
          <option>Refundable</option>
          <option>Non-Refundable</option>
        </select>
      </div>

      <div class="input-field">
        <span>Markup %</span>
        <input type="number" data-room="${index}" class="markup" value="5" />
      </div>

      <div class="input-field">
        <span>Rate price USD</span>
        <input type="number" data-room="${index}" class="base-price" />
      </div>

      <div class="input-field">
        <span>Booking.com USD</span>
        <input type="number" data-room="${index}" class="booking-price" />
      </div>

      ${showEur ? `
      <div class="input-field">
        <span>Rate price EUR</span>
        <input type="number" data-room="${index}" class="base-price-eur" />
      </div>

      <div class="input-field">
        <span>Booking.com EUR</span>
        <input type="number" data-room="${index}" class="booking-price-eur" />
      </div>` : ''}
    `;
    roomsContainer.appendChild(div);

    // Update event listeners
    ["room-type", "meal-plan", "refund", "base-price", "base-price-eur", "markup", "booking-price", "booking-price-eur"]
      .forEach(cn => {
        const element = div.querySelector(`.${cn}`);
        if (element) {
          element.addEventListener("input", updateRooms);
          element.addEventListener("change", updateRooms);
        }
      });
  }

  addRoomBtn.addEventListener("click", () => {
    rooms.push({});
    createRoomBlock(rooms.length - 1);
    renderQuote();
  });

  removeRoomBtn.addEventListener("click", () => {
    if (rooms.length > 0) {
      rooms.pop();
      const lastRoom = roomsContainer.lastElementChild;
      if (lastRoom) {
        roomsContainer.removeChild(lastRoom);
      }
      renderQuote();
    }
  });

  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Add event listener for EUR checkbox
  document.getElementById("showEur").addEventListener("change", function() {
    const showEur = this.checked;
    
    // Update existing rooms
    rooms.forEach((_, index) => {
      const roomBlock = roomsContainer.children[index];
      if (!roomBlock) return;

      // Add or remove EUR fields
      if (showEur) {
        const basePriceLabel = roomBlock.querySelector('.base-price').parentNode;
        const bookingPriceLabel = roomBlock.querySelector('.booking-price').parentNode;
        
        insertAfter(basePriceLabel, createEurInput('Rate price EUR:', `base-price-eur`));
        insertAfter(bookingPriceLabel, createEurInput('Booking.com EUR:', `booking-price-eur`));
      } else {
        roomBlock.querySelectorAll('.base-price-eur, .booking-price-eur')
          .forEach(el => el.parentNode.remove());
      }
    });
    
    updateRooms();
  });

  function createEurInput(label, className) {
    const div = document.createElement('div');
    div.className = 'input-field';
    div.innerHTML = `
      <span>${label}</span>
      <input type="number" class="${className}" />
    `;
    div.querySelector('input').addEventListener('input', updateRooms);
    return div;
  }

  function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }

  function updateRooms() {
    rooms = Array.from(roomsContainer.children).map(block => ({
      type: block.querySelector(".room-type").value,
      meal: block.querySelector(".meal-plan").value,
      refund: block.querySelector(".refund").value,
      base: parseFloat(block.querySelector(".base-price").value) || 0,
      markup: parseFloat(block.querySelector(".markup").value) || 0,
      booking: parseFloat(block.querySelector(".booking-price").value) || 0,
      baseEur: parseFloat(block.querySelector(".base-price-eur")?.value) || 0,
      bookingEur: parseFloat(block.querySelector(".booking-price-eur")?.value) || 0
    }));
    renderQuote();
  }

  function renderQuote() {
    const hotel = document.getElementById("hotelName").value;
    const stars = document.getElementById("hotelStars").value.replace(" Star", "*");
    const dates = document.getElementById("dateInput").value;
    const nights = document.getElementById("nightsCount").value;
    const adults = document.getElementById("numAdults").value;
    const children = document.getElementById("numChildren").value;

    const guestInfo = `👥 ${adults} Adult${adults > 1 ? 's' : ''}${children > 0 ? ` + ${children} Child${children > 1 ? 'ren' : ''}` : ''}`;
    
    const header = `🏨 ${hotel}, ${stars}
🗓 Stay Dates: ${dates}
${guestInfo}
🌙 ${nights} Nights\n`;
    
    const showEur = document.getElementById("showEur").checked;
    
    // Modified room text generation
    const roomsText = rooms.length ? rooms.map((r, i) => {
      if (!r.type) return '';
      const ourPrice = (r.base * (1 + r.markup / 100)).toFixed(2);
      const ourPriceEur = (r.baseEur * (1 + r.markup / 100)).toFixed(2);
      
      // Different format for single room vs multiple rooms
      const roomHeader = rooms.length === 1 ? 
        `✨ ${r.type}` : 
        `✨ Option ${i + 1}: ${r.type}`;
      
      return `
${roomHeader}
  • Room Description: ${r.meal}, ${r.refund}
  • Entravel.com: ${formatNumber(Math.round(ourPrice))} USD${showEur ? ` / ${formatNumber(Math.round(ourPriceEur))} EUR` : ''}
  • Booking.com: ${formatNumber(Math.round(r.booking))} USD${showEur ? ` / ${formatNumber(Math.round(r.bookingEur))} EUR` : ''}`;
    }).filter(text => text).join('\n⸻\n') : '';

    const hotelPhotos = document.getElementById("hotelPhotos").value;
    const locationLink = document.getElementById("locationLink").value;
    const tripAdvisorLink = document.getElementById("tripAdvisorLink").value;
    const embedLinks = document.getElementById("embedLinks").checked;

    // Create embedded links section
    const embeddedLinksText = embedLinks && (hotelPhotos || locationLink || tripAdvisorLink) ? `
📍 ${locationLink ? `[Location](${locationLink})` : 'Location'} | 📸 ${hotelPhotos ? `[Room Photos](${hotelPhotos})` : 'Room Photos'} | ⭐ ${tripAdvisorLink ? `[TripAdvisor Reviews](${tripAdvisorLink})` : 'TripAdvisor Reviews'}\n` : '';

    // Create regular links section if not embedded
    const linksArray = !embedLinks ? [
      ['Room Pictures', hotelPhotos],
      ['Location', locationLink],
      ['TripAdvisor', tripAdvisorLink]
    ].filter(([_, value]) => value) : [];

    const linksText = !embedLinks && linksArray.length ? `
🔗 Useful Links:
${linksArray.map(([label, value]) => `  • ${label}: ${value}`).join('\n')}` : '';

    // Update preview with conditional sections
    preview.textContent = `${header}${embeddedLinksText}${roomsText ? '\n' + roomsText : ''}${linksText ? '\n' + linksText : ''}`;
  }

  copyQuoteBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(preview.textContent)
      .then(() => alert("Quote copied!"))
      .catch(() => alert("Copy failed."));
  });

  // Initialize first render
  renderQuote();
});
