const requestTestOutline = {
  fandom: "Harry Potter",
  characters: ["Harry Potter", "Hermione Granger"],
  genre: "fantasy",
  tone: "adventurous"
};
fetch('/api/generate-outline', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(requestTestOutline)
})
.then(res => res.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));