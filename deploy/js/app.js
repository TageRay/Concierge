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
    "numAdults",
    "numChildren",
    "hotelPhotos",
    "locationLink",
    "tripAdvisorLink",
    "embedLinks",
    "showSecondaryCurrency",
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
      <option>Other</option>
    </select>
    <input type="text" data-room="${index}" class="meal-plan-custom" placeholder="Enter custom meal plan" style="display: none; margin-top:5px;"/>
  </div>

  <div class="input-field">
    <span>Refundability</span>
    <select data-room="${index}" class="refund">
      <option>Refundable</option>
      <option>Non-Refundable</option>
    </select>
  </div>

  <div class="input-field">
    <span>Refundability Deadline</span>
    <input type="date" data-room="${index}" class="refund-deadline" />
  </div>

  <div class="input-field">
    <span>Rate price USD</span>
    <input type="number" data-room="${index}" class="base-price" />
  </div>

  <div class="input-field">
    <span>Booking.com USD</span>
    <input type="number" data-room="${index}" class="booking-price" />
  </div>

  <div class="input-field">
    <span>Markup %</span>
    <input type="number" data-room="${index}" class="markup" value="5" />
  </div>

  <div class="input-field room-pictures-field" style="grid-column: span 2;">
    <span>Room Pictures</span>
    <input type="url" data-room="${index}" class="room-pictures" placeholder="https://example.com/room-photos" />
  </div>
  `;
    roomsContainer.appendChild(div);

    [
      "room-type", "meal-plan", "refund", "markup", "base-price", "booking-price", "room-pictures",
      "refund-deadline"
    ].forEach(cn => {
      const element = div.querySelector(`.${cn}`);
      if (element) {
        element.addEventListener("input", updateRooms);
        element.addEventListener("change", updateRooms);
      }
    });

    const mealPlanSelect = div.querySelector(".meal-plan");
    const mealPlanCustom = div.querySelector(".meal-plan-custom");
    mealPlanSelect.addEventListener("change", function() {
      if (this.value === "Other") {
        mealPlanCustom.style.display = "block";
        mealPlanCustom.focus();
      } else {
        mealPlanCustom.style.display = "none";
        mealPlanCustom.value = "";
      }
      updateRooms();
    });

    const refundSelect = div.querySelector(".refund");
    const refundDeadlineInput = div.querySelector(".refund-deadline");

    refundSelect.addEventListener("change", function() {
      if(this.value === "Non-Refundable") {
        refundDeadlineInput.value = "";  
        refundDeadlineInput.disabled = true;
      } else {
        refundDeadlineInput.disabled = false;
      }
      updateRooms();
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

  function updateRooms() {
    rooms = Array.from(roomsContainer.children).map(block => ({
      type: block.querySelector(".room-type").value,
      meal: (() => {
        const selectVal = block.querySelector(".meal-plan").value;
        const customVal = block.querySelector(".meal-plan-custom")?.value;
        return selectVal === "Other" && customVal ? customVal : selectVal;
      })(),
      refund: block.querySelector(".refund").value,
      refundDeadline: block.querySelector(".refund-deadline")?.value || "",
      base: parseFloat(block.querySelector(".base-price").value) || 0,
      markup: parseFloat(block.querySelector(".markup").value) || 0,
      booking: parseFloat(block.querySelector(".booking-price").value) || 0,
      roomPictures: block.querySelector(".room-pictures")?.value || ""
    }));
    renderQuote();
  }

  function calculateNights() {
    const checkInStr = document.getElementById("checkInDate").value;
    const checkOutStr = document.getElementById("checkOutDate").value;
    if (!checkInStr || !checkOutStr) return '';
    const checkIn = new Date(checkInStr);
    const checkOut = new Date(checkOutStr);
    const diffTime = checkOut - checkIn;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays > 0 ? diffDays : '';
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    return `${d.getDate()} ${d.toLocaleString('default', { month: 'long' })}`;
  }

  function renderQuote() {
    const hotel = document.getElementById("hotelName").value;
    const stars = document.getElementById("hotelStars").value.replace(" Star", "*");
    const checkIn = document.getElementById("checkInDate").value;
    const checkOut = document.getElementById("checkOutDate").value;
    
    const formattedDates = (checkIn && checkOut)
      ? `${formatDate(checkIn)} - ${formatDate(checkOut)} ${new Date(checkOut).getFullYear()}`
      : '';
    
    const nights = calculateNights() || '0';
    
    const adults = document.getElementById("numAdults").value;
    const children = document.getElementById("numChildren").value;
    const showEmoji = document.getElementById("showEmoji")?.checked;
    
    const hotelLabel   = showEmoji ? "🏨 " : "";
    const datesLabel   = showEmoji ? "🗓 " : "";
    const nightsLabel  = showEmoji ? "🌙 " : "";
    const guestLabel   = showEmoji ? "👥 " : "";
    const optionLabel  = showEmoji ? "✨ " : "";
    const linkLocation = showEmoji ? "📍 " : "";
    const linkPhotos   = showEmoji ? "📸 " : "";
    const linkTrip     = showEmoji ? "⭐ " : "";
    const usefulLinks  = showEmoji ? "🔗 " : "";
    
    const guestInfo = `${guestLabel}${adults} Adult${adults > 1 ? 's' : ''}` +
                      `${children > 0 ? ` + ${children} Child${children > 1 ? 'ren' : ''}` : ''}`;
    
    const header = `${hotelLabel}${hotel}, ${stars}
  ${datesLabel}Stay Dates: ${formattedDates}
  ${nightsLabel}${nights} Night${nights === "1" ? '' : 's'}
  ${guestInfo}`;
    
    const showSecondary = document.getElementById("showSecondaryCurrency").checked;
    const secondaryCurrency = showSecondary ? document.getElementById("secondaryCurrency").value : "";
    const exchangeRate = parseFloat(document.getElementById("exchangeRate").value) || 0;
    
    const roomsText = rooms.length ? rooms.map((r, i) => {
      const priceMultiplier = 1 + r.markup / 100;
      const ourPrice = ((r.base || 0) * priceMultiplier).toFixed(2);
      const ourPriceSecondary = exchangeRate ? (r.base * priceMultiplier * exchangeRate).toFixed(2) : "";
      const bookingPrice = ((r.booking || 0)).toFixed(2);
      const bookingPriceSecondary = exchangeRate ? (r.booking * exchangeRate).toFixed(2) : "";
      
      const formattedRefundDeadline = r.refundDeadline ? `${formatDate(r.refundDeadline)} ${new Date(r.refundDeadline).getFullYear()}` : "";
      const refundText = r.refundDeadline ? `${r.refund} until ${formattedRefundDeadline}` : r.refund;
      
      const roomTitle = r.type.trim() ? r.type : `Room Option ${i + 1}`;
      const roomHeader = rooms.length === 1 ? `${optionLabel}${roomTitle}` : `${optionLabel}Option ${i + 1}: ${roomTitle}`;
      
      let roomBlock = `
  ${roomHeader}
  • Room Description: ${r.meal}, ${refundText}
  • Entravel.com: ${formatNumber(Math.round(ourPrice))} USD` +
      (exchangeRate && secondaryCurrency ? ` (~${formatNumber(Math.round(ourPriceSecondary))} ${secondaryCurrency})` : "") +
      `\n  • Booking.com: ${formatNumber(Math.round(bookingPrice))} USD` +
      (exchangeRate && secondaryCurrency ? ` (~${formatNumber(Math.round(bookingPriceSecondary))} ${secondaryCurrency})` : "");
  
      if (r.roomPictures) {
        roomBlock += `\n  Room Pictures: ${r.roomPictures}`;
      }
      
      return roomBlock;
    }).join('\n⸻\n') : '';
    
    const hotelPhotos     = document.getElementById("hotelPhotos").value;
    const locationLink    = document.getElementById("locationLink").value;
    const tripAdvisorLink = document.getElementById("tripAdvisorLink").value;
    const embedLinks      = document.getElementById("embedLinks").checked;
    
    const embeddedLinksText = embedLinks && (hotelPhotos || locationLink || tripAdvisorLink) ? `
  ${linkLocation}${locationLink ? `[Location](${locationLink})` : 'Location'} | ${linkPhotos}${hotelPhotos ? `[Room Pictures](${hotelPhotos})` : 'Room Pictures'} | ${linkTrip}${tripAdvisorLink ? `[TripAdvisor Reviews](${tripAdvisorLink})` : 'TripAdvisor Reviews'}\n` : '';
    
    const linksArray = !embedLinks ? [
      ['Room Pictures', hotelPhotos, linkPhotos],
      ['Location', locationLink, linkLocation],
      ['TripAdvisor', tripAdvisorLink, linkTrip]
    ].filter(([_, value]) => value) : [];
    
    const linksText = !embedLinks && linksArray.length
      ? usefulLinks + "\nUseful Links:\n" +
        linksArray.map(([label, value, emoji]) => `  • ${emoji}${label}: ${value}`).join('\n')
      : '';
    
    preview.textContent = `${header}${embeddedLinksText}${roomsText ? '\n' + roomsText : ''}${linksText ? '\n' + linksText : ''}`;
  }

  copyQuoteBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(preview.textContent)
      .then(() => alert("Quote copied!"))
      .catch(() => alert("Copy failed."));
  });

  const autoNightsEl = document.getElementById("autoNights");
  if (autoNightsEl) {
    autoNightsEl.addEventListener("change", function() {
      const nightsInput = document.getElementById("nightsCount");
      const dates = document.getElementById("dateInput").value;
      
      nightsInput.readOnly = this.checked;
      if (this.checked && dates) {
        nightsInput.value = calculateNights(dates) || '';
      }
    });
  }

  document.getElementById("openShortenerBtn").addEventListener("click", function() {
    window.open("https://www.shorturl.at/", "_blank");
  });

  document.getElementById("currencyConverterBtn").addEventListener("click", function() {
    window.open("https://www.revolut.com/currency-converter/", "_blank");
  });

  document.getElementById("resetBtn").addEventListener("click", function() {
    const fieldsToReset = [
      "hotelName", "hotelStars", "checkInDate", "checkOutDate",
      "numAdults", "numChildren", "hotelPhotos", "locationLink", "tripAdvisorLink"
    ];
    
    fieldsToReset.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (id === "numAdults") {
        el.value = "2";
      } else if (id === "numChildren") {
        el.value = "0";
      } else if (el.type === "checkbox") {
        el.checked = false;
      } else {
        el.value = "";
      }
    });
    
    while(roomsContainer.firstChild) {
      roomsContainer.removeChild(roomsContainer.firstChild);
    }
    
    rooms = [];
    
    renderQuote();
  });

  document.getElementById("exchangeRate").addEventListener("input", renderQuote);
  document.getElementById("showSecondaryCurrency").addEventListener("change", renderQuote);
  document.getElementById("checkInDate").addEventListener("input", renderQuote);
  document.getElementById("checkInDate").addEventListener("change", renderQuote);
  document.getElementById("checkOutDate").addEventListener("input", renderQuote);
  document.getElementById("checkOutDate").addEventListener("change", renderQuote);
  ["embedLinks", "showSecondaryCurrency", "showEmoji"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", renderQuote);
      el.addEventListener("change", renderQuote);
    }
  });

  renderQuote();
});
