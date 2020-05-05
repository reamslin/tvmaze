/** Given a query string, return array of matching shows:
 *     { id, name, summary, episodesUrl }
 */


/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.  The function is async show it
 *       will be returning a promise.
 *
 *   - Returns an array of objects. Each object should include
 *     following show information:
 *    {
        id: <show id>,
        name: <show name>,
        summary: <show summary>,
        image: <an image from the show data, or a default imege if no image exists, (image isn't needed until later)>
      }
 */
async function searchShows(query) {
  const response = await axios.get('http://api.tvmaze.com/search/shows', {params: {q: query}});
  const shows = [];
  for (result of response.data) {
    const newShow = generateShowObject(result);
    shows.push(newShow);
  }
  return shows;
}

function generateShowObject(result) {
  return {
      id: result.show.id,
      name: result.show.name,
      summary: result.show.summary,
      image: result.show.image !== null ? result.show.image.original : 'https://tinyurl.com/tv-missing'
    }
}



/** Populate shows list:
 *     - given list of shows, add shows to DOM
 */

function populateShows(shows) {
  const $showsList = $("#shows-list");
  $showsList.empty();

  for (let show of shows) {
    let $item = $(
      `<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
         <div class="card" data-show-id="${show.id}">
         <img class="card-img-top" src=${show.image}>
           <div class="card-body">
             <h5 class="card-title">${show.name}</h5>
             <p class="card-text">${show.summary}</p>
             <button class="btn btn-info episodes-button">Episodes</button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($item);
  }
}


/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */

$("#search-form").on("submit", async function handleSearch (evt) {
  evt.preventDefault();

  let query = $("#search-query").val();
  if (!query) return;

  $("#episodes-area").hide();

  let shows = await searchShows(query);

  populateShows(shows);
});


/** Given a show ID, return list of episodes:
 *      { id, name, season, number }
 */

async function getEpisodes(id) {
  const response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
  console.log(response);
  const episodes = [];
  for (episode of response.data) {
    const newEpisode = generateEpisodeObject(episode);
    episodes.push(newEpisode);
  }
  return episodes;
}

function generateEpisodeObject(episode) {
  return {
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number
  }
}

function populateEpisodes(episodes){
  const $episodesArea = $('#episodes-area');
  $episodesArea.empty();
  $episodesArea.show();

  for (episode of episodes) {
    const $item = $(
      `<li>${episode.name} (season ${episode.season}, episode ${episode.number})</li>`
    )
    $episodesArea.append($item);
  }
}

$('#shows-list').on("click", ".episodes-button", async function handleEpisodeClick(e){
  console.log($(e.target).closest('.Show'));
  const id = $(e.target).closest('.Show').data('show-id');
  const episodes = await getEpisodes(id);
  populateEpisodes(episodes);
})