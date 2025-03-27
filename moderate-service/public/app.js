document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("moderationForm");
    const questionEl = document.getElementById("question");
    const answersContainer = document.getElementById("answersContainer");
    const correctSelect = document.getElementById("correct");
    const categoryEl = document.getElementById("category");
    const ackTagEl = document.getElementById("ackTag");
    const statusEl = document.getElementById("status");
    const rejectBtn = document.getElementById("rejectBtn");
  
    let currentAnswers = [];
    let awaitingModeration = false; // Track if UI is showing a question
  
    const categoryDropdown = document.createElement("select");
    categoryDropdown.id = "categoryDropdown";
    categoryDropdown.innerHTML = '<option value="">--Choose Existing Category--</option>';
    categoryEl.parentNode.insertBefore(categoryDropdown, categoryEl);
  
    categoryDropdown.addEventListener("change", () => {
      if (categoryDropdown.value) {
        categoryEl.value = categoryDropdown.value;
      }
    });
  
    const loadCategories = async () => {
      try {
        const res = await fetch("/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
  
        const data = await res.json();
        categoryDropdown.innerHTML = '<option value="">--Choose Existing Category--</option>';
  
        data.forEach(cat => {
          const option = document.createElement("option");
          option.value = cat;
          option.textContent = cat;
          categoryDropdown.appendChild(option);
        });
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
  
    const pollQueue = async () => {
      if (awaitingModeration) return; // Don’t fetch another if one is active
  
      try {
        const res = await fetch("/moderate");
        if (res.status === 204) {
          statusEl.textContent = "Waiting for new submissions...";
          form.classList.add("hidden");
          return;
        }
  
        const result = await res.json();
        if (!result || !result.data) {
          throw new Error("Invalid response from server");
        }
  
        const { question, answers, correct, category } = result.data;
        currentAnswers = answers;
  
        questionEl.value = question;
        categoryEl.value = category;
        ackTagEl.value = result.ackTag;
  
        answersContainer.innerHTML = "";
        correctSelect.innerHTML = "";
  
        answers.forEach((ans, i) => {
          const inputId = `answer-${i}`;
          const label = document.createElement("label");
          label.setAttribute("for", inputId);
          label.textContent = `Answer ${i + 1}:`;
  
          const input = document.createElement("input");
          input.type = "text";
          input.value = ans;
          input.required = true;
          input.id = inputId;
          input.dataset.index = i;
  
          input.addEventListener("input", () => {
            currentAnswers[i] = input.value;
            correctSelect.options[i].textContent = input.value;
          });
  
          answersContainer.appendChild(label);
          answersContainer.appendChild(input);
  
          const option = document.createElement("option");
          option.value = ans;
          option.textContent = ans;
          if (ans === correct) option.selected = true;
          correctSelect.appendChild(option);
        });
  
        form.classList.remove("hidden");
        statusEl.textContent = "Review and moderate the question below.";
        awaitingModeration = true; // Stop polling
      } catch (err) {
        console.error("Polling error:", err);
        statusEl.textContent = "Error contacting server...";
        form.classList.add("hidden");
      }
    };
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        question: questionEl.value.trim(),
        answers: currentAnswers,
        correct: correctSelect.value,
        category: categoryEl.value.trim(),
        ackTag: ackTagEl.value,
        approved: true
      };
  
      await fetch("/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
  
      form.classList.add("hidden");
      statusEl.textContent = "Submitted. Checking next...";
      awaitingModeration = false; // Resume polling
    });
  
    rejectBtn.addEventListener("click", async () => {
      await fetch("/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ackTag: ackTagEl.value,
          approved: false
        })
      });
  
      form.classList.add("hidden");
      statusEl.textContent = "Rejected. Checking next...";
      awaitingModeration = false; // Resume polling
    });
  
    loadCategories();
    setInterval(pollQueue, 1000); // Start polling
  });
  