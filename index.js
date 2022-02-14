document.addEventListener('DOMContentLoaded', () => {
    const detailImg = document.getElementById("detail-image");
    const detailTheme = document.getElementById("theme_titles")
    console.log(detailTheme);
    detailImg.src = 'https://www.artic.edu/iiif/2/e966799b-97ee-1cc6-bd2f-a94b4b8bb8f9/full/843,/0/default.jpg';
    detailImg.alt = 'Placeholder Image';
    detailTheme.textContent = `[
        "African American artists",
        "Women artists",
        "African Diaspora"
      ]`;
})