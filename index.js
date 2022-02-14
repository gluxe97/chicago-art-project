document.addEventListener("DOMContentLoaded", () => {
    //Save needed DOM elements to variables
    const detailImg = document.getElementById("detail-image");
    const detailTheme = document.getElementById("theme_titles");
    const searchForm = document.getElementById("artist-search");
    const artwork = document.getElementById("artwork-list");

    //Hardcoding values into our display div.
    //WILL BE REWRITTEN
    console.log(detailTheme);
    detailImg.src = 'https://www.artic.edu/iiif/2/e966799b-97ee-1cc6-bd2f-a94b4b8bb8f9/full/843,/0/default.jpg';
    detailImg.alt = 'Placeholder Image';
    detailTheme.textContent = `[
        "African American artists",
        "Women artists",
        "African Diaspora"
      ]`;

    //Add event listener on search form submit
    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const artist = e.target.search.value;
        //fetch to artworks/search endpoint to find id's of artworks by requested artist
        fetch(`https://api.artic.edu/api/v1/artworks/search?q=${artist}&limit=100&fields=id,artist_title`)
        .then((resp) => resp.json())
        .then((json) => {
            let i = 0;
            const artworkIds = [];

            while ((artworkIds.length < 10) && (i < json.data.length)) {
                if (json.data[i].artist_title === artist) {
                    console.log("if=true");
                    artworkIds.push(json.data[i].id)
                }
                i++;
            }
            fetchArtworks(artworkIds.join());
        })
    })

    //fetch to artworks endpoint with list of artwork ids
    //then display to artwork-list div
    function fetchArtworks(idString) {
        fetch(`https://api.artic.edu/api/v1/artworks?ids=${idString}`)
        .then((resp) => resp.json())
        .then((json) => {
            json.data.forEach((art) => {
                console.log(art.id,art.artist_title);
                const artDiv = document.createElement('div');
                const artTitle = document.createElement('p');
                const artImg = document.createElement('img');
                
                artDiv.id = art.id;
                artImg.src = `https://www.artic.edu/iiif/2/${art.image_id}/full/843,/0/default.jpg`
                artImg.alt = art.alt_text;
                artTitle.textContent = art.title;
                artDiv.append(artTitle, artImg);
                artwork.appendChild(artDiv);
            })
            
        })
    }
})