document.addEventListener("DOMContentLoaded", () => {
  const categorySelect = document.getElementById("categorySelect");
  const fetchBtn = document.getElementById("fetchBtn");
  const questionContainer = document.getElementById("questionContainer");
  const questionText = document.getElementById("questionText");
  const answersList = document.getElementById("answersList");

  // Load categories
  fetch("/categories")
    .then(res => res.json())
    .then(data => {
      categorySelect.innerHTML = `
        <option value="">--Select Category--</option>
        <option value="any">Any</option>
      `;

      data.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
      });
    });


  // Fetch question
  fetchBtn.addEventListener("click", () => {
    const selectedCategory = categorySelect.value;
    if (!selectedCategory) return alert("Select a category!");

    fetch(`/question/${selectedCategory}`)
      .then(res => res.json())
      .then(data => {
        const q = Array.isArray(data) ? data[0] : data; // handle single or array return
        if (!q || !q.question) {
          questionText.textContent = "No questions found.";
          questionContainer.classList.remove("hidden");
          answersList.innerHTML = "";
          return;
        }

        questionText.textContent = q.question;
        const answers = [...q.answers];
        const correct = q.correct;

        // Shuffle answers
        for (let i = answers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [answers[i], answers[j]] = [answers[j], answers[i]];
        }

        // Display answers
        answersList.innerHTML = "";
        answers.forEach(answer => {
          const li = document.createElement("li");
          li.textContent = answer;
          li.addEventListener("click", () => {
            // Disable all answer options after one is selected
            answersList.querySelectorAll('li').forEach(el => {
              el.style.pointerEvents = 'none';
              if (el.textContent === correct) {
                el.classList.add("correct"); // Highlight correct one
              }
              if (el.textContent === answer && answer !== correct) {
                el.classList.add("incorrect"); // Highlight wrong selection
              }
            });
          });
          answersList.appendChild(li);
        });

        questionContainer.classList.remove("hidden");
      });
  });
});
