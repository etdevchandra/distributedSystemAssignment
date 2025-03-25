document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("submitForm");
  const categoryDropdown = document.getElementById("categoryDropdown");
  const messageDiv = document.getElementById("message");

  // Load categories
  const loadCategories = async () => {
    console.log("Fetching categories from /categories...");
    try {
      const res = await fetch("/categories");
      console.log("Response status:", res.status);

      if (!res.ok) throw new Error("Failed to fetch categories");

      const data = await res.json();
      console.log("Categories received:", data);

      // Clear old options and set default
      categoryDropdown.innerHTML = '<option value="">--Select Existing Category--</option>';

      data.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categoryDropdown.appendChild(option);
      });

      console.log("Categories populated in dropdown.");
    } catch (err) {
      console.error("Error loading categories:", err.message);
      messageDiv.textContent = "Could not load categories. Please try again later.";
    }
  };

  // Initial call to load categories
  loadCategories();

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
    console.log("Submitting payload:", payload);

    try {
      const res = await fetch("/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      console.log("Submit response:", result);

      if (res.ok) {
        messageDiv.textContent = "Question submitted successfully!";
        form.reset();
        await loadCategories(); // Refresh categories in case a new one was added
      } else {
        messageDiv.textContent = result.error || "Submission failed.";
      }
    } catch (err) {
      console.error("Submission error:", err);
      messageDiv.textContent = "Error submitting question.";
    }
  });
});
