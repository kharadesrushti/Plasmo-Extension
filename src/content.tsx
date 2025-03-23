import { useEffect } from "react";
import cssText from "data-text:~style.css";
import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
  matches: ["https://www.linkedin.com/feed/*"],
};

export const getStyle = () => {
  const style = document.createElement("style");
  style.textContent = cssText;
  return style;
};

// Function to create "+" button
const createPlusButton = (postContainer: HTMLElement) => {
  const plusButton = document.createElement("div");
  plusButton.className = "plus-button";
  plusButton.style.cursor = "pointer";
  plusButton.style.width = "25px";
  plusButton.style.height = "25px";
  plusButton.style.marginLeft = "10px";
  plusButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <circle cx="19" cy="5" r="2"/>
          <circle cx="5" cy="19" r="2"/>
          <path d="M10.4 21.9a10 10 0 0 0 9.941-15.416"/>
          <path d="M13.5 2.1a10 10 0 0 0-9.841 15.416"/>
      </svg>
  `;

  plusButton.addEventListener("click", async (event) => {
    event.stopPropagation();
    const activeEditor = postContainer.querySelector(
      ".comments-comment-box-comment__text-editor .ql-editor[contenteditable='true']"
    ) as HTMLElement;

    if (activeEditor) {
      const personaDropdown = postContainer.querySelector(
        ".persona-dropdown"
      ) as HTMLSelectElement;
      const selectedPersona = personaDropdown?.value || "casual";

      await insertPostDetails(activeEditor, postContainer, selectedPersona);
    } else {
      alert("Error: Could not find the comment editor.");
    }
  });

  return plusButton;
};

// Function to create persona dropdown
const createPersonaDropdown = () => {
  const dropdown = document.createElement("select");
  dropdown.className = "persona-dropdown";
  dropdown.style.padding = "5px";
  dropdown.style.borderRadius = "5px";
  dropdown.style.border = "1px solid #ccc";
  dropdown.style.cursor = "pointer";
  dropdown.style.width = "150px";

  const personas = ["Professional", "Funny", "Casual", "Inspiring"];

  personas.forEach((persona) => {
    const option = document.createElement("option");
    option.value = persona.toLowerCase();
    option.textContent = persona;
    dropdown.appendChild(option);
  });

  return dropdown;
};

// Function to fetch comments from API
const fetchCommentFromAPI = async (postContent: string, selectedPersona: string) => {
  try {
    const apiUrl = "https://postgen-liard.vercel.app/api/comments/generate";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postContent,
        persona: selectedPersona.toLowerCase(),
        tone: "medium",
      }),
    });

    if (!response.ok) {
      return `Error: ${response.status} ${response.statusText}`;
    }

    const data = await response.json();
    return data?.comment?.quote || "No comment generated.";
  } catch (error) {
    return "Network error.";
  }
};

// Function to insert generated comment into LinkedIn comment box
const insertPostDetails = async (
  textArea: HTMLElement,
  postContainer: HTMLElement,
  selectedPersona: string
) => {
  textArea.focus();
  textArea.innerHTML = `<p style="color: gray;">Generating...</p>`;
  textArea.dispatchEvent(new Event("input", { bubbles: true }));

  const postText =
    postContainer.querySelector(".feed-shared-update-v2__description")
      ?.textContent?.trim() || "No post content available.";

  const generatedComment = await fetchCommentFromAPI(postText, selectedPersona);

  // ✅ FIX: Ensure the comment appears correctly
  textArea.innerHTML = `<p>${generatedComment}</p>`;
  textArea.dispatchEvent(new Event("input", { bubbles: true }));
};

// Function to add dropdown and button above the comment section
const addDropdownAboveComments = (postContainer: HTMLElement) => {
  const actionBar = postContainer.querySelector(
    ".feed-shared-social-action-bar--full-width"
  );

  if (!actionBar || postContainer.querySelector(".dropdown-plus-container")) {
    return;
  }

  const plusButton = createPlusButton(postContainer);
  const personaDropdown = createPersonaDropdown();

  const container = document.createElement("div");
  container.className = "dropdown-plus-container";
  container.style.display = "flex";
  container.style.alignItems = "center";
  container.style.gap = "10px";
  container.style.marginBottom = "10px";

  container.appendChild(personaDropdown);
  container.appendChild(plusButton);
  actionBar.insertAdjacentElement("afterend", container);
};

// Event listener to check for post container
document.body.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;

  if (!target) return;

  const postContainer = target.closest(".feed-shared-update-v2") as HTMLElement;
  if (postContainer) {
    addDropdownAboveComments(postContainer);
  }
});
