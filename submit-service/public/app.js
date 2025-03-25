document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("submitForm");
    const categoryDropdown = document.getElementById("categoryDropdown");
    const messageDiv = document.getElementById("message");
  
    // Load categories
    fetch("/categories")
      .then(res => res.json())
      .then(data => {
        data.forEach(cat => {
          const option = document.createElement("option");
          option.value = cat;
          option.textContent = cat;
          categoryDropdown.appendChild(option);
        });
      });
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const question = document.getElementById("question").value.trim();
      const answers = [
        document.getElementById("answer1").value.trim(),
        document.getElementById("answer2").value.trim(),
        document.getElementById("answer3").value.trim(),
        document.getElementById("answer4").value.trim(),
      ];
      const correctIndex = document.getElementById("correct").value;
      const correct = answers[parseInt(correctIndex) - 1];
  
      let category = categoryDropdown.value;
      const newCategory = document.getElementById("newCategory").value.trim();
      if (newCategory) category = newCategory;
  
      if (!question || answers.some(a => !a) || !correct || !category) {
        messageDiv.textContent = "Please fill in all fields.";
        return;
      }
  
      const payload = { question, answers, correct, category };
  
      try {
        const res = await fetch("/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
  
        const result = await res.json();
        if (res.ok) {
          messageDiv.textContent = "Question submitted successfully!";
          form.reset();
        } else {
          messageDiv.textContent = (result.error || "Submission failed.");
        }
      } catch (err) {
        messageDiv.textContent = "Error submitting question.";
      }
    });
  });
  