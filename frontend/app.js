const authForm = document.getElementById("auth-form");
const loginInput = document.getElementById("login");
const passwordInput = document.getElementById("password");
const authBanner = document.getElementById("auth-banner");
const form = document.getElementById("search-form");
const enpInput = document.getElementById("enp");
const searchButton = document.getElementById("search-button");
const resetButton = document.getElementById("reset-button");
const logoutButton = document.getElementById("logout-button");
const resultsContainer = document.getElementById("results");
const statusBanner = document.getElementById("status-banner");
const resultCounter = document.getElementById("result-counter");
const API_BASE = String(window.APP_CONFIG?.apiBase || "").replace(/\/+$/, "");
const LOGIN_PAGE = "/";
const SEARCH_PAGE = "/search.html";
const isLoginPage = Boolean(authForm);
const isSearchPage = Boolean(form);
const blockedShortcutKeys = new Set(["a", "c", "p", "s", "u", "x"]);

const kindLabels = {
  "ДВ4": "Диспансеризация взрослого населения, 1 этап",
  "ДВ2": "Диспансеризация взрослого населения, 2 этап",
  "УД1": "Углубленная диспансеризация взрослого населения",
  "ОПВ": "Профилактический медицинский осмотр взрослого населения",
  "ДР1": "Диспансеризация репродуктивного возраста, 1 этап",
  "ДР2": "Диспансеризация репродуктивного возраста, 2 этап",
};

const organizationLabels = {
  "410001": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ "КАМЧАТСКАЯ КРАЕВАЯ БОЛЬНИЦА ИМ.А.С.ЛУКАШЕВСКОГО" (ГБУЗ "КАМЧАТСКАЯ КРАЕВАЯ БОЛЬНИЦА ИМ. А. С. ЛУКАШЕВСКОГО")',
  "410002": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ "КАМЧАТСКАЯ КРАЕВАЯ ДЕТСКАЯ БОЛЬНИЦА" (ГБУЗ ККДБ)',
  "410003": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ "КАМЧАТСКАЯ КРАЕВАЯ СТОМАТОЛОГИЧЕСКАЯ ПОЛИКЛИНИКА" (ГБУЗ ККСП)',
  "410004": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ "КАМЧАТСКИЙ КРАЕВОЙ КОЖНО-ВЕНЕРОЛОГИЧЕСКИЙ ДИСПАНСЕР" (ГБУЗ КККВД)',
  "410005": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ "КАМЧАТСКИЙ КРАЕВОЙ КАРДИОЛОГИЧЕСКИЙ ДИСПАНСЕР" (ГБУЗ КККД)',
  "410006": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ "КАМЧАТСКИЙ КРАЕВОЙ ОНКОЛОГИЧЕСКИЙ ДИСПАНСЕР" (ГБУЗ ККОД)',
  "410007": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ "КОРЯКСКАЯ ОКРУЖНАЯ БОЛЬНИЦА" (ГБУЗ КОБ)',
  "410008": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ КАМЧАТСКОГО КРАЯ "ПЕТРОПАВЛОВСК-КАМЧАТСКАЯ ГОРОДСКАЯ БОЛЬНИЦА № 1" (ГБУЗ КК "ПЕТРОПАВЛОВСК-КАМЧАТСКАЯ ГОРОДСКАЯ БОЛЬНИЦА № 1")',
  "410009": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ КАМЧАТСКОГО КРАЯ "ПЕТРОПАВЛОВСК-КАМЧАТСКАЯ ГОРОДСКАЯ БОЛЬНИЦА № 2" (ГБУЗ КК "ПЕТРОПАВЛОВСК-КАМЧАТСКАЯ ГОРОДСКАЯ БОЛЬНИЦА № 2")',
  "410010": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ КАМЧАТСКОГО КРАЯ "ПЕТРОПАВЛОВСК-КАМЧАТСКАЯ ГОРОДСКАЯ ГЕРИАТРИЧЕСКАЯ БОЛЬНИЦА" (ГБУЗ КК "ПЕТРОПАВЛОВСК-КАМЧАТСКАЯ ГОРОДСКАЯ ГЕРИАТРИЧЕСКАЯ БОЛЬНИЦА")',
  "410011": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ КАМЧАТСКОГО КРАЯ "ПЕТРОПАВЛОВСК-КАМЧАТСКАЯ ГОРОДСКАЯ ПОЛИКЛИНИКА №1" (ГБУЗ КК "ПЕТРОПАВЛОВСК-КАМЧАТСКАЯ ГОРОДСКАЯ ПОЛИКЛИНИКА № 1")',
  "410012": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ КАМЧАТСКОГО КРАЯ "ПЕТРОПАВЛОВСК-КАМЧАТСКАЯ ГОРОДСКАЯ ПОЛИКЛИНИКА № 3" (ГБУЗ КК ПК ГП № 3)',
  "410013": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ "КАМЧАТСКИЙ КРАЕВОЙ РОДИЛЬНЫЙ ДОМ" (ГБУЗ "ККРД")',
  "410014": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ КАМЧАТСКОГО КРАЯ "ПЕТРОПАВЛОВСК-КАМЧАТСКАЯ ГОРОДСКАЯ СТОМАТОЛОГИЧЕСКАЯ ПОЛИКЛИНИКА" (ГБУЗ КК П-К ГСП)',
  "410015": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ КАМЧАТСКОГО КРАЯ "ПЕТРОПАВЛОВСК-КАМЧАТСКАЯ ГОРОДСКАЯ ДЕТСКАЯ ПОЛИКЛИНИКА № 1" (ГБУЗ КК ПК ГДП № 1)',
  "410016": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ КАМЧАТСКОГО КРАЯ ПЕТРОПАВЛОВСК-КАМЧАТСКАЯ ГОРОДСКАЯ ДЕТСКАЯ ПОЛИКЛИНИКА №2 (ГБУЗ КК ПК ГДП №2)',
  "410017": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ КАМЧАТСКОГО КРАЯ "ПЕТРОПАВЛОВСК-КАМЧАТСКАЯ ГОРОДСКАЯ ДЕТСКАЯ СТОМАТОЛОГИЧЕСКАЯ ПОЛИКЛИНИКА" (ГБУЗ КК ПК ГДСП)',
  "410018": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ КАМЧАТСКОГО КРАЯ "ЕЛИЗОВСКАЯ РАЙОННАЯ БОЛЬНИЦА" (ГБУЗ КК ЕРБ)',
  "410019": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ КАМЧАТСКОГО КРАЯ "ЕЛИЗОВСКАЯ РАЙОННАЯ СТОМАТОЛОГИЧЕСКАЯ ПОЛИКЛИНИКА" (ГБУЗ КК ЕРСП)',
  "410028": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ КАМЧАТСКОГО КРАЯ "МИЛЬКОВСКАЯ РАЙОННАЯ БОЛЬНИЦА" (ГБУЗ КК "МИЛЬКОВСКАЯ РБ")',
  "410029": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ КАМЧАТСКОГО КРАЯ "УСТЬ-БОЛЬШЕРЕЦКАЯ РАЙОННАЯ БОЛЬНИЦА" (ГБУЗ КК "УСТЬ-БОЛЬШЕРЕЦКАЯ РБ")',
  "410030": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ КАМЧАТСКОГО КРАЯ "УСТЬ-КАМЧАТСКАЯ РАЙОННАЯ БОЛЬНИЦА" (ГБУЗ КК "УСТЬ-КАМЧАТСКАЯ РБ")',
  "410031": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ КАМЧАТСКОГО КРАЯ "КЛЮЧЕВСКАЯ РАЙОННАЯ БОЛЬНИЦА" (ГБУЗ КК "КЛЮЧЕВСКАЯ РАЙОННАЯ БОЛЬНИЦА")',
  "410032": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ КАМЧАТСКОГО КРАЯ "СОБОЛЕВСКАЯ РАЙОННАЯ БОЛЬНИЦА" (ГБУЗ КК СРБ)',
  "410033": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ КАМЧАТСКОГО КРАЯ "БЫСТРИНСКАЯ РАЙОННАЯ БОЛЬНИЦА" (ГБУЗ КК "БЫСТРИНСКАЯ РБ")',
  "410035": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ КАМЧАТСКОГО КРАЯ "ВИЛЮЧИНСКАЯ ГОРОДСКАЯ БОЛЬНИЦА" (ГБУЗ КК ВГБ)',
  "410036": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ КАМЧАТСКОГО КРАЯ "НИКОЛЬСКАЯ РАЙОННАЯ БОЛЬНИЦА" (ГБУЗ КК "НРБ")',
  "410037": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ КАМЧАТСКОГО КРАЯ "ТИГИЛЬСКАЯ РАЙОННАЯ БОЛЬНИЦА" (ГБУЗ КК "ТИГИЛЬСКАЯ РБ")',
  "410038": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ КАМЧАТСКОГО КРАЯ "КАРАГИНСКАЯ РАЙОННАЯ БОЛЬНИЦА" (ГБУЗ КК КРБ)',
  "410039": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ КАМЧАТСКОГО КРАЯ "ОЛЮТОРСКАЯ РАЙОННАЯ БОЛЬНИЦА" (ГБУЗ КК "ОЛЮТОРСКАЯ РАЙОННАЯ БОЛЬНИЦА")',
  "410040": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ КАМЧАТСКОГО КРАЯ "ПЕНЖИНСКАЯ РАЙОННАЯ БОЛЬНИЦА" (ГБУЗ КК "ПЕНЖИНСКАЯ РБ")',
  "410046": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ "КАМЧАТСКАЯ КРАЕВАЯ ДЕТСКАЯ ИНФЕКЦИОННАЯ БОЛЬНИЦА" (ГБУЗ ККДИБ)',
  "410047": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ КАМЧАТСКОГО КРАЯ "ОЗЕРНОВСКАЯ РАЙОННАЯ БОЛЬНИЦА" (ГБУЗ КК "ОЗЕРНОВСКАЯ РАЙОННАЯ БОЛЬНИЦА")',
  "410051": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ КАМЧАТСКОГО КРАЯ "ЕЛИЗОВСКАЯ СТАНЦИЯ СКОРОЙ МЕДИЦИНСКОЙ ПОМОЩИ" (ГБУЗ КК ЕССМП)',
  "410052": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ КАМЧАТСКОГО КРАЯ "ПЕТРОПАВЛОВСК-КАМЧАТСКАЯ ГОРОДСКАЯ СТАНЦИЯ СКОРОЙ МЕДИЦИНСКОЙ ПОМОЩИ" (ГБУЗКК "ПЕТРОПАВЛОВСК-КАМЧАТСКАЯ ГОРОДСКАЯ СТАНЦИЯ СКОРОЙ МЕДИЦИНСКОЙ ПОМОЩИ")',
  "410068": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ "КАМЧАТСКИЙ КРАЕВОЙ ЦЕНТР ОБЩЕСТВЕННОГО ЗДОРОВЬЯ И МЕДИЦИНСКОЙ ПРОФИЛАКТИКИ" (ГБУЗ КК ЦОЗМП)',
  "410077": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ "КАМЧАТСКИЙ КРАЕВОЙ ЦЕНТР ПО ПРОФИЛАКТИКЕ И БОРЬБЕ СО СПИД И ИНФЕКЦИОННЫМИ ЗАБОЛЕВАНИЯМИ" (ГБУЗ ЦЕНТР СПИД)',
  "410089": 'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ "КАМЧАТСКИЙ КРАЕВОЙ ПРОТИВОТУБЕРКУЛЕЗНЫЙ ДИСПАНСЕР" (ГБУЗ ККПТД)',
};

const normalizeSpaces = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

const normalizeDate = (value) => {
  const trimmed = normalizeSpaces(value);
  if (!trimmed) {
    return "";
  }

  const dottedMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})$/);
  if (dottedMatch) {
    const [, day, month, year] = dottedMatch;
    const normalizedYear = year.length === 2 ? `20${year}` : year;
    return `${day.padStart(2, "0")}.${month.padStart(2, "0")}.${normalizedYear}`;
  }

  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (slashMatch) {
    const [, month, day, year] = slashMatch;
    const yearNumber = Number(year);
    const normalizedYear = year.length === 2 ? String(yearNumber >= 50 ? 1900 + yearNumber : 2000 + yearNumber) : year;
    return `${day.padStart(2, "0")}.${month.padStart(2, "0")}.${normalizedYear}`;
  }

  const digits = trimmed.replace(/[^\d]/g, "");
  if (digits.length === 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
  }

  if (/^\d{5}$/.test(trimmed)) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    excelEpoch.setUTCDate(excelEpoch.getUTCDate() + Number(trimmed));
    const day = String(excelEpoch.getUTCDate()).padStart(2, "0");
    const month = String(excelEpoch.getUTCMonth() + 1).padStart(2, "0");
    const year = String(excelEpoch.getUTCFullYear());
    return `${day}.${month}.${year}`;
  }

  return trimmed;
};

const composeFullName = (record) => normalizeSpaces([record.lastName, record.firstName, record.patronymic].join(" "));

const setStatus = (message, tone = "") => {
  if (!statusBanner) {
    return;
  }
  statusBanner.textContent = message;
  statusBanner.className = "status-banner";
  if (tone) statusBanner.classList.add(tone);
};

const setAuthStatus = (message, tone = "") => {
  if (!authBanner) {
    return;
  }
  authBanner.textContent = message;
  authBanner.className = "status-banner auth-banner";
  if (tone) authBanner.classList.add(tone);
};

const setCounter = (count) => {
  if (!resultCounter) {
    return;
  }
  resultCounter.textContent = count === 0 ? "Записей не найдено" : count === 1 ? "Найдена 1 запись" : `Найдено записей: ${count}`;
};

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  let payload = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    payload = await response.json();
  }

  if (response.status === 401) {
    throw new Error((payload && payload.detail) || "Нужна авторизация.");
  }
  if (!response.ok) {
    throw new Error((payload && payload.detail) || `Ошибка сервера: ${response.status}`);
  }

  return payload;
};

const redirectToLogin = () => {
  window.location.href = LOGIN_PAGE;
};

const redirectToSearch = () => {
  window.location.href = SEARCH_PAGE;
};

const protectSearchPage = () => {
  if (!isSearchPage) {
    return;
  }

  const denyAction = (event) => {
    const target = event.target;
    const allowInputAction = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
    if (allowInputAction && (event.type === "copy" || event.type === "cut")) {
      return;
    }

    event.preventDefault();
  };

  document.addEventListener("contextmenu", denyAction);
  document.addEventListener("copy", denyAction);
  document.addEventListener("cut", denyAction);
  document.addEventListener("dragstart", denyAction);
  document.addEventListener("selectstart", (event) => {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      return;
    }
    event.preventDefault();
  });

  window.addEventListener("keydown", (event) => {
    const key = String(event.key || "").toLowerCase();
    const withModifier = event.ctrlKey || event.metaKey;
    if (withModifier && blockedShortcutKeys.has(key)) {
      event.preventDefault();
    }
    if (key === "printscreen") {
      event.preventDefault();
    }
  });

  window.addEventListener("beforeprint", () => {
    document.body.classList.add("is-print-blocked");
  });

  window.addEventListener("afterprint", () => {
    document.body.classList.remove("is-print-blocked");
  });
};

const normalizeServerRecord = (record) => ({
  enp: normalizeSpaces(record.enp),
  lastName: normalizeSpaces(record.lastName ?? record.fam),
  firstName: normalizeSpaces(record.firstName ?? record.im),
  patronymic: normalizeSpaces(record.patronymic ?? record.ot),
  birthDate: normalizeDate(record.birthDate ?? record.DR ?? record.dr),
  organizationCode: normalizeSpaces(record.organizationCode ?? record.lpu),
  startDate: normalizeDate(record.startDate ?? record.DATE_Z_1 ?? record.date_z_1),
  endDate: normalizeDate(record.endDate ?? record.DATE_Z_2 ?? record.date_z_2),
  kind: normalizeSpaces(record.kind ?? record.DISP ?? record.disp),
});

const renderResults = (items) => {
  if (!resultsContainer) {
    return;
  }

  resultsContainer.innerHTML = "";
  if (!items.length) {
    return;
  }

  items.forEach((record) => {
    const card = document.createElement("article");
    card.className = "result-card";
    const displayName = composeFullName(record);
    const kindTitle = kindLabels[record.kind] || record.kind;
    const organizationTitle = organizationLabels[record.organizationCode] || "Расшифровка организации не найдена";
    const period = record.startDate && record.endDate
      ? record.startDate === record.endDate
        ? record.startDate
        : `${record.startDate} - ${record.endDate}`
      : record.startDate || record.endDate || "Не указано";

    card.innerHTML = `
      <div class="result-card-header">
        <div>
          <div class="result-name">${displayName}</div>
          <div class="result-enp">ЕНП: ${record.enp}</div>
        </div>
      </div>
      <div class="result-details">
        <div class="detail-item">
          <div class="detail-label">Дата рождения</div>
          <div class="detail-value">${record.birthDate || "Не указана"}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Организация</div>
          <div class="detail-value">${organizationTitle}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Время прохождения</div>
          <div class="detail-value">${period}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Вид</div>
          <div class="detail-value">${kindTitle || "Не указан"}</div>
        </div>
      </div>
    `;

    resultsContainer.appendChild(card);
  });
};

const checkSession = async () => {
  const payload = await fetchJson(`${API_BASE}/session`);
  return Boolean(payload?.authenticated);
};

const login = async () => {
  const username = normalizeSpaces(loginInput?.value);
  const password = String(passwordInput?.value || "");

  if (!username || !password) {
    setAuthStatus("Введите логин и пароль.", "is-warning");
    return;
  }

  setAuthStatus("Проверяю логин и пароль...", "is-warning");
  await fetchJson(`${API_BASE}/login`, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  if (passwordInput) {
    passwordInput.value = "";
  }
  redirectToSearch();
};

const logout = async () => {
  try {
    await fetchJson(`${API_BASE}/logout`, { method: "POST" });
  } catch {
  }
  redirectToLogin();
};

const runSearch = async () => {
  if (!enpInput || !resultsContainer) {
    throw new Error("Страница загружена не полностью. Обновите ее и попробуйте снова.");
  }

  const enp = String(enpInput.value || "").replace(/\D/g, "");
  if (!enp) {
    setStatus("Введите ЕНП для поиска.", "is-warning");
    resultsContainer.innerHTML = "";
    setCounter(0);
    return;
  }

  setStatus("Выполняю поиск на сервере...", "is-warning");
  const payload = await fetchJson(`${API_BASE}/search?enp=${encodeURIComponent(enp)}`);
  const rawItems = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : [];
  const matches = rawItems.map(normalizeServerRecord);

  setCounter(matches.length);
  if (!matches.length) {
    setStatus("Совпадений по ЕНП не найдено. Проверьте введенный номер.", "is-warning");
    renderResults([]);
    return;
  }

  setStatus("Поиск выполнен. Ниже отображены найденные сведения.", "is-success");
  renderResults(matches);
};

if (authForm) {
  authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    login().catch((error) => {
      setAuthStatus(error.message || "Не удалось выполнить вход.", "is-warning");
    });
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    logout().catch(() => {
      redirectToLogin();
    });
  });
}

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    runSearch().catch((error) => {
      if ((error.message || "").includes("авториза") || (error.message || "").includes("сесс")) {
        redirectToLogin();
        return;
      }
      setCounter(0);
      renderResults([]);
      setStatus(error.message || "Не удалось выполнить поиск на сервере.", "is-warning");
    });
  });
}

if (resetButton && form && resultsContainer) {
  resetButton.addEventListener("click", () => {
    form.reset();
    resultsContainer.innerHTML = "";
    setCounter(0);
    setStatus("Введите ЕНП и выполните поиск.");
  });
}

if (enpInput) {
  enpInput.addEventListener("input", () => {
    enpInput.value = enpInput.value.replace(/[^\d]/g, "").slice(0, 16);
  });
}

if (isLoginPage) {
  setAuthStatus("Введите логин и пароль.");
  checkSession().then((authenticated) => {
    if (authenticated) {
      redirectToSearch();
    }
  }).catch(() => {
    setAuthStatus("Введите логин и пароль.");
  });
}

if (isSearchPage) {
  protectSearchPage();
  setCounter(0);
  setStatus("Проверяю доступ...", "is-warning");
  checkSession().then((authenticated) => {
    if (!authenticated) {
      redirectToLogin();
      return;
    }
    setStatus("Введите ЕНП и выполните поиск.");
    enpInput?.focus();
  }).catch(() => {
    redirectToLogin();
  });
}
