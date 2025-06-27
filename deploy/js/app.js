document.addEventListener("DOMContentLoaded", () => {
  const roomsContainer = document.getElementById("roomsContainer");
  const addRoomBtn = document.getElementById("addRoomBtn");
  const removeRoomBtn = document.getElementById("removeRoomBtn");
  const copyQuoteBtn = document.getElementById("copyQuoteBtn");
  const preview = document.getElementById("quotePreview");

  let rooms = [];

  function handleInputChange() {
    renderQuote();
  }

  const inputs = [
    "hotelName",
    "hotelStars",
    "dateInput",
    "numAdults",
    "numChildren",
    "hotelPhotos",
    "locationLink",
    "tripAdvisorLink",
    "embedLinks",
    "showEur",
    "nightsCount",
    "autoNights",
    "showEmoji"
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
          <option>Half-Board</option>
          <option>Full-Board</option>
          <option>All-Inclusive</option>
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

  document.getElementById("showEur").addEventListener("change", function() {
    const showEur = this.checked;
    
    rooms.forEach((_, index) => {
      const roomBlock = roomsContainer.children[index];
      if (!roomBlock) return;

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

  function calculateNights(dateString) {
    const dates = dateString.split(/[-–]/).map(d => d.trim());
    if (dates.length !== 2) return '';

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentYear = new Date().getFullYear();

    function parseDate(dateStr) {
      const [day, month] = dateStr.split(' ');
      const monthIndex = months.findIndex(m => month.includes(m));
      if (monthIndex === -1) return null;
      return new Date(currentYear, monthIndex, parseInt(day));
    }

    const startDate = parseDate(dates[0]);
    const endDate = parseDate(dates[1]);

    if (!startDate || !endDate) return '';

    const nights = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : '';
  }

  function renderQuote() {
    const hotel = document.getElementById("hotelName").value;
    const stars = document.getElementById("hotelStars").value.replace(" Star", "*");
    const dates = document.getElementById("dateInput").value;
    const nights = document.getElementById("nightsCount").value || '0';
    const adults = document.getElementById("numAdults").value;
    const children = document.getElementById("numChildren").value;
    const showEmoji = document.getElementById("showEmoji")?.checked;

    // Emoji or plain text labels
    const hotelLabel = showEmoji ? "🏨 " : "";
    const datesLabel = showEmoji ? "🗓 " : "";
    const nightsLabel = showEmoji ? "🌙 " : "";
    const guestLabel = showEmoji ? "👥 " : "";
    const optionLabel = showEmoji ? "✨ " : "";
    const linkLocation = showEmoji ? "📍 " : "";
    const linkPhotos = showEmoji ? "📸 " : "";
    const linkTrip = showEmoji ? "⭐ " : "";
    const usefulLinks = showEmoji ? "🔗 " : "";

    const guestInfo = `${guestLabel}${adults} Adult${adults > 1 ? 's' : ''}${children > 0 ? ` + ${children} Child${children > 1 ? 'ren' : ''}` : ''}`;

    const header = `${hotelLabel}${hotel}, ${stars}
${datesLabel}Stay Dates: ${dates}
${nightsLabel}${nights} Nights
${guestInfo}`;

    const showEur = document.getElementById("showEur").checked;

    const roomsText = rooms.length ? rooms.map((r, i) => {
      if (!r.type) return '';
      const ourPrice = (r.base * (1 + r.markup / 100)).toFixed(2);
      const ourPriceEur = (r.baseEur * (1 + r.markup / 100)).toFixed(2);

      const roomHeader = rooms.length === 1 ?
        `${optionLabel}${r.type}` :
        `${optionLabel}Option ${i + 1}: ${r.type}`;

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

    const embeddedLinksText = embedLinks && (hotelPhotos || locationLink || tripAdvisorLink) ? `
${linkLocation}${locationLink ? `[Location](${locationLink})` : 'Location'} | ${linkPhotos}${hotelPhotos ? `[Room Photos](${hotelPhotos})` : 'Room Photos'} | ${linkTrip}${tripAdvisorLink ? `[TripAdvisor Reviews](${tripAdvisorLink})` : 'TripAdvisor Reviews'}\n` : '';

    const linksArray = !embedLinks ? [
      ['Room Pictures', hotelPhotos, linkPhotos],
      ['Location', locationLink, linkLocation],
      ['TripAdvisor', tripAdvisorLink, linkTrip]
    ].filter(([_, value]) => value) : [];

    const linksText = !embedLinks && linksArray.length ? `
${usefulLinks}Useful Links:
${linksArray.map(([label, value, emoji]) => `  • ${emoji}${label}: ${value}`).join('\n')}` : '';

    preview.textContent = `${header}${embeddedLinksText}${roomsText ? '\n' + roomsText : ''}${linksText ? '\n' + linksText : ''}`;
  }

  copyQuoteBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(preview.textContent)
      .then(() => alert("Quote copied!"))
      .catch(() => alert("Copy failed."));
  });

  document.getElementById("autoNights").addEventListener("change", function() {
    const nightsInput = document.getElementById("nightsCount");
    const dates = document.getElementById("dateInput").value;
    
    nightsInput.readOnly = this.checked;
    if (this.checked && dates) {
      nightsInput.value = calculateNights(dates) || '';
    }
  });

  document.getElementById("dateInput").addEventListener("input", function() {
    const autoNights = document.getElementById("autoNights").checked;
    const nightsInput = document.getElementById("nightsCount");
    
    if (autoNights) {
      nightsInput.value = calculateNights(this.value) || '';
    }
    renderQuote();
  });

  document.getElementById("openShortenerBtn").addEventListener("click", function() {
    window.open("https://www.shorturl.at/", "_blank");
  });

  renderQuote();
});
