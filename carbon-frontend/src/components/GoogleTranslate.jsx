import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { createPortal } from "react-dom";

import "../styles/GoogleTranslate.css";

const GoogleTranslate = () => {
  const location = useLocation();

  // =========================================================
  // CURRENT LANGUAGE
  // =========================================================
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return (
      sessionStorage.getItem("carbontrack_language") || "en"
    );
  });

  // =========================================================
  // POPUP STATE
  // =========================================================
  const [isOpen, setIsOpen] = useState(false);

  // =========================================================
  // LANGUAGES
  // =========================================================
  const [languages, setLanguages] = useState([]);

  // =========================================================
  // SEARCH
  // =========================================================
  const [search, setSearch] = useState("");

  // =========================================================
  // LANGUAGE NAVBAR SLOT
  // =========================================================
  const [languageSlot, setLanguageSlot] = useState(null);

  // =========================================================
  // HIDE GOOGLE TRANSLATE UI
  // =========================================================
  const hideGoogleTranslateUI = () => {
    document
      .querySelectorAll("body > .skiptranslate")
      .forEach((element) => {
        element.style.setProperty(
          "display",
          "none",
          "important"
        );

        element.style.setProperty(
          "visibility",
          "hidden",
          "important"
        );

        element.style.setProperty(
          "opacity",
          "0",
          "important"
        );

        element.style.setProperty(
          "width",
          "0px",
          "important"
        );

        element.style.setProperty(
          "height",
          "0px",
          "important"
        );

        element.style.setProperty(
          "max-height",
          "0px",
          "important"
        );

        element.style.setProperty(
          "position",
          "fixed",
          "important"
        );

        element.style.setProperty(
          "top",
          "-10000px",
          "important"
        );

        element.style.setProperty(
          "left",
          "-10000px",
          "important"
        );

        element.style.setProperty(
          "z-index",
          "-999999",
          "important"
        );
      });

    document
      .querySelectorAll(
        [
          ".goog-te-banner-frame",
          "iframe.goog-te-banner-frame",
          "iframe.goog-te-banner-frame.skiptranslate",
          "iframe.skiptranslate",
        ].join(", ")
      )
      .forEach((element) => {
        element.style.setProperty(
          "display",
          "none",
          "important"
        );

        element.style.setProperty(
          "visibility",
          "hidden",
          "important"
        );

        element.style.setProperty(
          "opacity",
          "0",
          "important"
        );

        element.style.setProperty(
          "width",
          "0px",
          "important"
        );

        element.style.setProperty(
          "height",
          "0px",
          "important"
        );

        element.style.setProperty(
          "max-height",
          "0px",
          "important"
        );

        element.style.setProperty(
          "position",
          "fixed",
          "important"
        );

        element.style.setProperty(
          "top",
          "-10000px",
          "important"
        );

        element.style.setProperty(
          "left",
          "-10000px",
          "important"
        );

        element.style.setProperty(
          "z-index",
          "-999999",
          "important"
        );
      });

    document
      .querySelectorAll(".goog-te-balloon-frame")
      .forEach((element) => {
        element.style.setProperty(
          "display",
          "none",
          "important"
        );

        element.style.setProperty(
          "visibility",
          "hidden",
          "important"
        );

        element.style.setProperty(
          "opacity",
          "0",
          "important"
        );
      });

    document.documentElement.style.setProperty(
      "top",
      "0px",
      "important"
    );

    document.body.style.setProperty(
      "top",
      "0px",
      "important"
    );

    document.body.style.setProperty(
      "margin-top",
      "0px",
      "important"
    );
  };

  // =========================================================
  // LOAD LANGUAGES FROM GOOGLE TRANSLATE
  // =========================================================
  const loadGoogleLanguages = () => {
    const select =
      document.querySelector(".goog-te-combo");

    if (!select) {
      return;
    }

    const googleLanguages = Array.from(
      select.options
    )
      .filter((option) =>
        option.textContent.trim()
      )
      .map((option) => ({
        code:
          option.value === ""
            ? "en"
            : option.value,
        name: option.textContent.trim(),
      }));

    const otherLanguages =
      googleLanguages.filter(
        (language) =>
          language.code !== "en"
      );

    setLanguages([
      {
        code: "en",
        name: "English",
      },
      ...otherLanguages,
    ]);
  };

  // =========================================================
  // INITIALIZE GOOGLE TRANSLATE
  // =========================================================
  useEffect(() => {
    const initializeGoogleTranslate = () => {
      const element =
        document.getElementById(
          "google_translate_element"
        );

      if (
        !element ||
        !window.google ||
        !window.google.translate
      ) {
        return;
      }

      if (
        element.dataset.initialized ===
        "true"
      ) {
        loadGoogleLanguages();
        hideGoogleTranslateUI();
        return;
      }

      element.innerHTML = "";

      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          autoDisplay: false,
        },
        "google_translate_element"
      );

      element.dataset.initialized = "true";

      setTimeout(() => {
        loadGoogleLanguages();
        hideGoogleTranslateUI();
      }, 100);

      setTimeout(() => {
        loadGoogleLanguages();
        hideGoogleTranslateUI();
      }, 500);

      setTimeout(() => {
        loadGoogleLanguages();
        hideGoogleTranslateUI();
      }, 1000);

      setTimeout(() => {
        loadGoogleLanguages();
        hideGoogleTranslateUI();
      }, 2000);
    };

    window.googleTranslateElementInit =
      initializeGoogleTranslate;

    if (
      !document.getElementById(
        "google-translate-script"
      )
    ) {
      const script =
        document.createElement("script");

      script.id =
        "google-translate-script";

      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";

      script.async = true;

      document.body.appendChild(script);
    } else {
      initializeGoogleTranslate();
    }

    const interval = setInterval(() => {
      initializeGoogleTranslate();

      const select =
        document.querySelector(
          ".goog-te-combo"
        );

      hideGoogleTranslateUI();

      if (select) {
        loadGoogleLanguages();
        clearInterval(interval);
      }
    }, 300);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // =========================================================
  // SUPPORTED LANGUAGE PAGES
  // =========================================================
  const isLanguagePage =
    location.pathname === "/" ||
    location.pathname === "/dashboard" ||
    location.pathname === "/admin-dashboard";

  // =========================================================
  // FIND LANGUAGE SLOT
  // =========================================================
  useEffect(() => {
    if (!isLanguagePage) {
      setLanguageSlot(null);
      return;
    }

    const findSlot = () => {
      const slots =
        document.querySelectorAll(
          "#carbontrack-language-slot"
        );

      if (!slots.length) {
        return;
      }

      /*
       * AdminDashboard currently contains the same
       * ID twice.
       *
       * We prefer the slot inside the navbar-right
       * section so the language button appears in
       * the correct navbar position.
       */

      const adminNavbarSlot =
        document.querySelector(
          ".admin-nav-right #carbontrack-language-slot"
        );

      if (adminNavbarSlot) {
        setLanguageSlot(adminNavbarSlot);
        return;
      }

      /*
       * For Landing Page / User Dashboard,
       * use the first available slot.
       */

      setLanguageSlot(slots[0]);
    };

    findSlot();

    const timeout1 =
      setTimeout(findSlot, 100);

    const timeout2 =
      setTimeout(findSlot, 300);

    const timeout3 =
      setTimeout(findSlot, 500);

    const timeout4 =
      setTimeout(findSlot, 1000);

    const timeout5 =
      setTimeout(findSlot, 1500);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      clearTimeout(timeout4);
      clearTimeout(timeout5);
    };
  }, [location.pathname, isLanguagePage]);

  // =========================================================
  // READ SAVED LANGUAGE
  // =========================================================
  useEffect(() => {
    const detectCurrentLanguage = () => {
      const savedLanguage =
        sessionStorage.getItem(
          "carbontrack_language"
        );

      // -----------------------------------------------------
      // If saved language is English, keep English.
      // -----------------------------------------------------
      if (savedLanguage === "en") {
        setCurrentLanguage("en");
        return;
      }

      // -----------------------------------------------------
      // If another language is saved, use it.
      // -----------------------------------------------------
      if (savedLanguage) {
        setCurrentLanguage(
          savedLanguage
        );
        return;
      }

      // -----------------------------------------------------
      // Check Google Translate cookie
      // -----------------------------------------------------
      const cookie =
        document.cookie
          .split("; ")
          .find((row) =>
            row.startsWith(
              "googtrans="
            )
          );

      if (!cookie) {
        setCurrentLanguage("en");
        return;
      }

      try {
        const value =
          decodeURIComponent(
            cookie.substring(
              "googtrans=".length
            )
          );

        const parts =
          value.split("/");

        if (
          parts.length >= 3 &&
          parts[2]
        ) {
          const googleLanguage =
            parts[2];

          setCurrentLanguage(
            googleLanguage
          );

          sessionStorage.setItem(
            "carbontrack_language",
            googleLanguage
          );
        }
      } catch (error) {
        console.error(
          "Google Translate cookie error:",
          error
        );
      }
    };

    const timeout1 =
      setTimeout(
        detectCurrentLanguage,
        500
      );

    const timeout2 =
      setTimeout(
        detectCurrentLanguage,
        1500
      );

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, []);

  // =========================================================
  // REMOVE GOOGLE TRANSLATE COOKIE
  // =========================================================
  const clearGoogleTranslateCookie = () => {
    const hostname =
      window.location.hostname;

    const cookieDomains = [
      "",
      `.${hostname}`,
      hostname,
    ];

    cookieDomains.forEach((domain) => {
      const domainPart = domain
        ? `; domain=${domain}`
        : "";

      document.cookie =
        `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/${domainPart}`;
    });

    document.cookie =
      "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
  };

  // =========================================================
  // CHANGE LANGUAGE
  // =========================================================
  const changeLanguage = (languageCode) => {
    // -------------------------------------------------------
    // SAVE CURRENT LANGUAGE
    // -------------------------------------------------------
    setCurrentLanguage(languageCode);

    sessionStorage.setItem(
      "carbontrack_language",
      languageCode
    );

    // -------------------------------------------------------
    // CLOSE POPUP
    // -------------------------------------------------------
    setIsOpen(false);
    setSearch("");

    // =======================================================
    // ENGLISH / DEFAULT
    // =======================================================
    if (languageCode === "en") {

      clearGoogleTranslateCookie();

      sessionStorage.setItem(
        "carbontrack_language",
        "en"
      );

      /*
       * Google Translate modifies the DOM directly.
       * Reloading restores the original English
       * React page.
       */
      setTimeout(() => {
        window.location.reload();
      }, 100);

      return;
    }

    // =======================================================
    // OTHER LANGUAGES
    // =======================================================
    const select =
      document.querySelector(
        ".goog-te-combo"
      );

    if (!select) {
      console.error(
        "Google Translate dropdown not found."
      );
      return;
    }

    // -------------------------------------------------------
    // Select requested Google language
    // -------------------------------------------------------
    select.value = languageCode;

    select.dispatchEvent(
      new Event("change", {
        bubbles: true,
      })
    );

    // -------------------------------------------------------
    // KEEP GOOGLE UI HIDDEN
    // -------------------------------------------------------
    hideGoogleTranslateUI();

    setTimeout(() => {
      hideGoogleTranslateUI();
    }, 50);

    setTimeout(() => {
      hideGoogleTranslateUI();
    }, 100);

    setTimeout(() => {
      hideGoogleTranslateUI();
    }, 250);

    setTimeout(() => {
      hideGoogleTranslateUI();
    }, 500);

    setTimeout(() => {
      hideGoogleTranslateUI();
    }, 1000);

    setTimeout(() => {
      hideGoogleTranslateUI();
    }, 2000);
  };

  // =========================================================
  // DEFAULT = ENGLISH
  // =========================================================
  const resetToDefaultLanguage = () => {
    changeLanguage("en");
  };

  // =========================================================
  // ESCAPE KEY
  // =========================================================
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setSearch("");
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  // =========================================================
  // CLOSE POPUP WHEN ROUTE CHANGES
  // =========================================================
  useEffect(() => {
    setIsOpen(false);
    setSearch("");

    setTimeout(() => {
      hideGoogleTranslateUI();
    }, 50);
  }, [location.pathname]);

  // =========================================================
  // CONTINUOUSLY HIDE GOOGLE TRANSLATE TOP BAR
  // =========================================================
  useEffect(() => {
    hideGoogleTranslateUI();

    const interval =
      setInterval(() => {
        hideGoogleTranslateUI();
      }, 200);

    const observer =
      new MutationObserver(() => {
        hideGoogleTranslateUI();
      });

    observer.observe(
      document.body,
      {
        childList: true,
        subtree: true,
      }
    );

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  // =========================================================
  // SELECTED LANGUAGE NAME
  // =========================================================
  const selectedLanguageName =
    languages.find(
      (language) =>
        language.code ===
        currentLanguage
    )?.name || "English";

  // =========================================================
  // FILTER LANGUAGES
  // =========================================================
  const filteredLanguages =
    languages.filter((language) =>
      language.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  // =========================================================
  // OPEN LANGUAGE POPUP
  // =========================================================
  const openLanguagePopup = () => {
    loadGoogleLanguages();
    hideGoogleTranslateUI();

    setSearch("");
    setIsOpen(true);
  };

  // =========================================================
  // LANGUAGE BUTTON
  // =========================================================
  const languageButton =
    isLanguagePage &&
    languageSlot &&
    createPortal(
      <button
        type="button"
        className="carbon-language-button"
        onClick={openLanguagePopup}
      >
        <span className="carbon-language-icon">
          🌐
        </span>

        <span className="carbon-language-text">
          {selectedLanguageName}
        </span>

        <span className="carbon-language-arrow">
          ▾
        </span>
      </button>,
      languageSlot
    );

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <>
      {/* =====================================================
          HIDDEN GOOGLE TRANSLATE ENGINE
          ===================================================== */}
      <div
        id="google_translate_element"
        className="google-translate-engine"
      />

      {/* =====================================================
          CUSTOM LANGUAGE BUTTON
          ===================================================== */}
      {languageButton}

      {/* =====================================================
          LANGUAGE POPUP
          ===================================================== */}
      {isLanguagePage &&
        isOpen && (
          <div
            className="carbon-language-overlay"
            onClick={() => {
              setIsOpen(false);
              setSearch("");
            }}
          >
            <div
              className="carbon-language-modal"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >

              {/* =================================================
                  HEADER
                  ================================================= */}
              <div className="carbon-language-header">

                <div className="carbon-language-title-area">

                  <div className="carbon-language-leaf">
                    🌿
                  </div>

                  <div>

                    <div className="carbon-language-title-row">

                      <h3>
                        Choose Language
                      </h3>

                      <button
                        type="button"
                        className="carbon-language-default"
                        onClick={
                          resetToDefaultLanguage
                        }
                      >
                        Default
                      </button>

                    </div>

                    <p>
                      Translate CarbonTrack
                    </p>

                  </div>

                </div>

                {/* CLOSE BUTTON */}

                <button
                  type="button"
                  className="carbon-language-close"
                  onClick={() => {
                    setIsOpen(false);
                    setSearch("");
                  }}
                >
                  ×
                </button>

              </div>

              {/* =================================================
                  SEARCH
                  ================================================= */}
              <div className="carbon-language-search">

                <span>
                  ⌕
                </span>

                <input
                  type="text"
                  placeholder="Search language..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  autoFocus
                />

              </div>

              {/* =================================================
                  LANGUAGE LIST
                  ================================================= */}
              <div className="carbon-language-list">

                {filteredLanguages.length > 0 ? (

                  filteredLanguages.map(
                    (language) => (

                      <button
                        type="button"
                        key={language.code}
                        className={`carbon-language-option ${
                          currentLanguage ===
                          language.code
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          changeLanguage(
                            language.code
                          )
                        }
                      >

                        <span>
                          {language.name}
                        </span>

                        {currentLanguage ===
                          language.code && (

                          <span className="carbon-language-check">
                            ✓
                          </span>

                        )}

                      </button>

                    )
                  )

                ) : (

                  <div className="carbon-language-empty">

                    {languages.length === 0
                      ? "Loading languages..."
                      : "No language found"}

                  </div>

                )}

              </div>

              {/* =================================================
                  FOOTER
                  ================================================= */}
              <div className="carbon-language-footer">

                <span>
                  Powered by Google Translate
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setSearch("");
                  }}
                >
                  Close
                </button>

              </div>

            </div>
          </div>
        )}

    </>
  );
};

export default GoogleTranslate;