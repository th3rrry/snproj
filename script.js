let cooldowns = {}; // { pair: { endTime: ..., intervalId: ... } }
let currentPair = ""; // глобально

document.addEventListener("DOMContentLoaded", () => {
    const generateButton = document.getElementById("generate-btn");
    const signalResult = document.getElementById("signal-result");
    const signalTime = document.getElementById("signal-time");
    const currencySelect = document.getElementById("currency-pair");

    let signalUpdateTimeout = null;
    currentPair = currencySelect.value;

    function getAccuracyRange(timeframeText) {
    const tf = timeframeText.toLowerCase();

    // Русский / English / Uzbek
    if (tf.includes("5 секунд")   || tf.includes("5 seconds")   || tf.includes("5 soniya")
     || tf.includes("5 सेकंड")   // Hindi 5 seconds
     || tf.includes("٥ ثواني")    || tf.includes("٥ ثانية")    // Arabic 5 seconds (арабская «5»)
     || tf.includes("5 ثواني")   || tf.includes("5 ثانية")) {
      return [20, 65];
    }
    if (tf.includes("15 секунд")  || tf.includes("15 seconds")  || tf.includes("15 soniya")
     || tf.includes("15 सेकंड")  // Hindi 15 seconds
     || tf.includes("١٥ ثواني")  || tf.includes("١٥ ثانية")  // Arabic 15 seconds
     || tf.includes("15 ثواني")  || tf.includes("15 ثانية")) {
      return [20, 71];
    }

    if (tf.includes("1 минута")   || tf.includes("1 minute")    || tf.includes("1 daqiqa")
     || tf.includes("1 मिनट")     // Hindi 1 minute
     || tf.includes("١ دقيقة")    || tf.includes("1 دقيقة")    // Arabic 1 minute
     || tf.includes("1 دقائق")) { // арабское «دقائق»
      return [20, 75];
    }
    if (tf.includes("3 минуты")   || tf.includes("3 minutes")   || tf.includes("3 daqiqa")
     || tf.includes("3 मिनट")     // Hindi 3 minutes
     || tf.includes("٣ دقائق")    || tf.includes("3 دقائق")    // Arabic 3 minutes
    ) {
      return [20, 82];
    }
    if (tf.includes("5 минут")    || tf.includes("5 minutes")   || tf.includes("5 daqiqa")
     || tf.includes("5 मिनट")     // Hindi 5 minutes
     || tf.includes("٥ دقائق")    || tf.includes("5 دقائق")    // Arabic 5 minutes
    ) {
      return [20, 87];
    }
    if (tf.includes("10 минут")   || tf.includes("10 minutes")  || tf.includes("10 daqiqa")
     || tf.includes("10 मिनट")    // Hindi 10 minutes
     || tf.includes("١٠ دقائق")   || tf.includes("10 دقائق")   // Arabic 10 minutes
    ) {
      return [20, 95];
    }

    return [70, 85];
  }

    generateButton.addEventListener("click", () => {
        generateButton.disabled = true;
        const language = document.getElementById("language").value;
        generateButton.textContent = translations[language].generateButton + "...";

        if (signalUpdateTimeout) clearTimeout(signalUpdateTimeout);

        // Рандомное время анализа от 2 до 5 секунд (в мс)
        const analyzeDuration = Math.floor(2000 + Math.random() * 3000);

        // Показываем "Идет анализ..." со спиннером
        signalResult.innerHTML = `
            <div class="signal-analyzing">
                ${translations[language].analyzing}
                <span class="dots">
                    <span>.</span><span>.</span><span>.</span>
                </span>
                <div class="spinner"></div>
            </div>
        `;
        signalTime.textContent = "";

    signalUpdateTimeout = setTimeout(() => {
        const currencyPair = currencySelect.value;
        const timeframeText = document.getElementById("timeframe").value;
        const cooldownDuration = parseTimeframeToMs(timeframeText);

        const isBuy = Math.random() > 0.5;
        const [minAcc, maxAcc] = getAccuracyRange(timeframeText);
        const accuracy = (Math.random() * (maxAcc - minAcc) + minAcc).toFixed(2);
        const now = new Date().toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });

        const arrow    = isBuy ? '↑' : '↓';
        const dirClass = isBuy ? 'green' : 'red';
        const word     = translations[language][ isBuy ? 'buy' : 'sell' ];

        const signalDetails = `
        <div class="signal-details">
            <div class="signal-pair">${currencyPair}</div>
            <div class="signal-direction ${dirClass}">
            <span class="signal-arrow">${arrow}</span>
            <span class="signal-word">${word}</span>
            <span class="signal-arrow">${arrow}</span>
            </div>
            <div class="signal-timeframe">
            ${translations[language].timeframe}: ${timeframeText}
            </div>
            <div class="signal-probability">
            ${translations[language].accuracy}: ${accuracy}%
            </div>
        </div>
        `;
        signalResult.innerHTML = signalDetails;
        signalTime.textContent = now;

        const endTime = Date.now() + cooldownDuration;

        if (cooldowns[currencyPair]?.intervalId) {
            clearInterval(cooldowns[currencyPair].intervalId);
        }

        cooldowns[currencyPair] = { endTime };
        startCooldown(currencyPair);
    }, analyzeDuration);
});


    currencySelect.addEventListener("change", () => {
        const newPair = currencySelect.value;

        if (cooldowns[currentPair]?.intervalId) {
            clearInterval(cooldowns[currentPair].intervalId);
        }

        currentPair = newPair;

        if (cooldowns[newPair] && cooldowns[newPair].endTime > Date.now()) {
            startCooldown(newPair);
        } else {
            generateButton.disabled = false;
            generateButton.textContent = translations[document.getElementById("language").value].generateButton;
        }
    });
});


(() => {
  const allowedPageUrl = "https://th3rrry.github.io/snproj/";

  const currentPageUrl = window.location.href;

  if (!currentPageUrl.startsWith(allowedPageUrl)) {
    // Очистка и тревожный экран
    document.documentElement.innerHTML = "";

    const style = document.createElement("style");
    style.textContent = `
      @keyframes blinkRedWhite {
        0%, 100% { background-color: red; color: white; }
        50% { background-color: white; color: red; }
      }
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        animation: blinkRedWhite 1s infinite;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: Arial, sans-serif;
        font-weight: bold;
        font-size: clamp(2.5rem, 8vw, 6rem);
        text-align: center;
        user-select: none;
        border: none;
        box-shadow: none;
      }
      .warning-text {
        max-width: 90vw;
        padding: 0 20px;
        border: none;
      }
    `;
    document.head.appendChild(style);

    const warningText = document.createElement("div");
    warningText.className = "warning-text";
    warningText.textContent = "Владелец: @bellucc11";
    document.body.appendChild(warningText);

    throw new Error("Запуск скрипта на недопустенной странице запрещён");
  }
})();


function startCooldown(pair) {
    const generateButton = document.getElementById("generate-btn");

    function updateCooldown() {
        const now = Date.now();
        const remaining = Math.ceil((cooldowns[pair].endTime - now) / 1000);
        const language = document.getElementById("language").value;
        const baseText = translations[language].generateButton;

        if (remaining <= 0) {
            clearInterval(cooldowns[pair].intervalId);
            generateButton.disabled = false;
            generateButton.textContent = baseText;
            delete cooldowns[pair];
        } else {
            generateButton.disabled = true;
            generateButton.textContent = `${baseText} (${remaining}s)`;
        }
    }

    updateCooldown();
    cooldowns[pair].intervalId = setInterval(updateCooldown, 1000);
}

function parseTimeframeToMs(timeframeText) {
  const lowercase = timeframeText.toLowerCase();
  const numberMatch = lowercase.match(/\d+/);
  const value = numberMatch ? parseInt(numberMatch[0], 10) : 30;

  // English
  if (lowercase.includes("second"))          return value * 1000;
  if (lowercase.includes("minute") || lowercase.includes("min")) return value * 60 * 1000;

  // Русский
  if (lowercase.includes("секунд") || lowercase.includes("секунда")) return value * 1000;
  if (lowercase.includes("минут")  || lowercase.includes("минута"))  return value * 60 * 1000;

  // Узбекский
  if (lowercase.includes("soniya")) return value * 1000;
  if (lowercase.includes("daqiqa")) return value * 60 * 1000;

  // Hindi
  if (lowercase.includes("सेकंड")) return value * 1000;
  if (lowercase.includes("मिनट"))  return value * 60 * 1000;

  // Arabic
  if (lowercase.includes("ثانية") || lowercase.includes("ثواني")) return value * 1000;
  if (lowercase.includes("دقيقة") || lowercase.includes("دقائق")) return value * 60 * 1000;

  // По умолчанию 30 секунд
  return 30000;
}


function resetSignalAndChart() {
    const signalResult = document.getElementById("signal-result");
    const signalTime = document.getElementById("signal-time");

    signalResult.innerHTML = `<div class="signal-placeholder">${translations[document.getElementById("language").value].signalPlaceholder}</div>`;
    signalTime.textContent = "";
}


const translations = {
    ru: {
        currencyLabel: "Инструмент",
        timeframeLabel: "Время",
        generateButton: "Получить сигнал",
        signalTitle: "Сигнал",
        signalPlaceholder: "Нажмите 'Получить сигнал'",
        timeframes: ["5 секунд", "15 секунд", "1 минута", "3 минуты", "5 минут", "10 минут"],
        buy: "Купить",
        sell: "Продать",
        timeframe: "Временной интервал",
        accuracy: "Точность",
        analyzing: "Идет анализ"
    },
    en: {
        currencyLabel: "Instrument",
        timeframeLabel: "Time",
        generateButton: "Get Signal",
        signalTitle: "Signal",
        signalPlaceholder: "Click 'Get Signal'",
        timeframes: ["5 seconds", "15 seconds", "1 minute", "3 minutes", "5 minutes", "10 minutes"],
        buy: "Buy",
        sell: "Sell",
        timeframe: "Timeframe",
        accuracy: "Accuracy",
        analyzing: "Analyzing"
    },
    uz: {
        currencyLabel: "Asbob",
        timeframeLabel: "Vaqt",
        generateButton: "Signal Olish",
        signalTitle: "Signal",
        signalPlaceholder: "Signal Olish uchun bosing",
        timeframes: ["5 soniya", "15 soniya", "1 daqiqa", "3 daqiqa", "5 daqiqa", "10 daqiqa"],
        buy: "Sotib olish",
        sell: "Sotish",
        timeframe: "Vaqt oralig'i",
        accuracy: "Aniqlik",
        analyzing: "Tahlil qilinmoqda"
    },
    hi: {
        currencyLabel: "उपकरण",
        timeframeLabel: "समय",
        generateButton: "सिग्नल प्राप्त करें",
        signalTitle: "सिग्नल",
        signalPlaceholder: "क्लिक करें 'सिग्नल प्राप्त करें'",
        timeframes: ["5 सेकंड","15 सेकंड","1 मिनट","3 मिनट","5 मिनट","10 मिनट"],
        buy: "खरीदें",
        sell: "बेचें",
        timeframe: "समय सीमा",
        accuracy: "सटीकता",
        analyzing: "विश्लेषण हो रहा है"
    },
    ar: {
        currencyLabel: "الأداة",
        timeframeLabel: "الوقت",
        generateButton: "الحصول على الإشارة",
        signalTitle: "الإشارة",
        signalPlaceholder: "انقر 'الحصول على الإشارة'",
        timeframes: [
        "5 ثواني",
        "15 ثانية",
        "1 دقيقة",
        "3 دقائق",
        "5 دقائق",
        "10 دقائق"
        ],
        buy: "شراء",
        sell: "بيع",
        timeframe: "الإطار الزمني",
        accuracy: "الدقة",
        analyzing: "جاري التحليل"
  }
};

document.querySelectorAll('.theme-selector .theme-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // снять отметку active у всех
    document.querySelectorAll('.theme-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const theme = btn.dataset.theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  });
});

// при загрузке
const saved = localStorage.getItem('theme') || 'light';
const initBtn = document.querySelector(`.theme-btn[data-theme="${saved}"]`);
if (initBtn) initBtn.click();


function changeLanguage() {
    const language = document.getElementById("language").value;

    const currencyLabelElement = document.getElementById("currency-label");
    if (currencyLabelElement) currencyLabelElement.textContent = translations[language].currencyLabel;

    const timeframeLabelElement = document.getElementById("timeframe-label");
    if (timeframeLabelElement) timeframeLabelElement.textContent = translations[language].timeframeLabel;

    const generateButtonElement = document.getElementById("generate-btn");
    if (generateButtonElement) generateButtonElement.textContent = translations[language].generateButton;

    const signalTitleElement = document.getElementById("signal-title");
    if (signalTitleElement) signalTitleElement.textContent = translations[language].signalTitle;

    const signalResultElement = document.getElementById("signal-result");
    if (signalResultElement) {
        const signalPlaceholderElement = signalResultElement.querySelector(".signal-placeholder");
        if (signalPlaceholderElement) {
            signalPlaceholderElement.textContent = translations[language].signalPlaceholder;
        }
    }

    const timeframeSelect = document.getElementById("timeframe");
    const timeframes = translations[language].timeframes;

    timeframeSelect.innerHTML = "";
    timeframes.forEach(timeframe => {
        const option = document.createElement("option");
        option.textContent = timeframe;
        timeframeSelect.appendChild(option);
    });

    resetSignalAndChart();
}

function toggleLangDropdown() {
    const dropdown = document.getElementById("lang-options");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

document.addEventListener("click", (e) => {
    const dropdown = document.getElementById("custom-language-selector");
    const options = document.getElementById("lang-options");
    if (!dropdown.contains(e.target)) {
        options.style.display = "none";
    }
});

document.querySelectorAll(".lang-item").forEach(item => {
    item.addEventListener("click", () => {
        const lang = item.dataset.lang;
        const flag = item.dataset.flag;
        const text = item.textContent.trim();

        // Обновить кастомный селектор
        document.getElementById("current-flag").src = flag;
        document.getElementById("current-lang-text").textContent = text;

        // Обновить скрытый селект
        document.getElementById("language").value = lang;

        // Скрыть выпадающее меню
        document.getElementById("lang-options").style.display = "none";

        // Обновить язык
        changeLanguage();
    });
});
