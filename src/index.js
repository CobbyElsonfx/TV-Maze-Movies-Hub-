import './style.css';
import {
  getMoviesData,
  postLikes, postComment,
  getLikesForUnclick,
  fetchCommentsFromApi,
  renderComments,
  getLikes,
} from './modules/functionalities.js';
import { showApiUrl } from './modules/showsAPI.js';

// api imports
import { likeApi, commentApi } from './modules/involvementAPI.js';
import 'bootstrap';

// testing
import { countComments, moviesCount } from './modules/counter.js';

import './assets/bg-for-page.jpg';
import './assets/button-menu.png';
import './assets/close-icon.svg';
import modalContent from './modules/reservation.js';

const renderMovies = async () => {
  const data = await getMoviesData(showApiUrl);
  data.sort(() => 0.5 - Math.random());
  data.length = 20;
  const countsMovie = document.getElementById('countsMovie');
  countsMovie.textContent = moviesCount(data);
  const movieContainer = document.getElementById('movieContainer');

  data.forEach(async (movie) => {
    const movieCard = document.createElement('div');
    movieCard.classList.add('col-md-3', 'col-sm-6', 'mb-4');
    movieCard.innerHTML = `
      <div class="card custom-card">
        <img src=${movie.image.medium} class="card-img-top" alt="images">
        <div class="card-body">
          <div  class="name-like-button">
             <div>
              <span class="card-title">${movie.name}</span>
             </div>
            <div  class="likeBtnContainer">
              <span class="likesCount${movie.id}">0</span>
              <span class="likeBtn" data-movie-id="${movie.id}">&#9825</span>
            </div>
          </div>
          <div class="card-button">
            <button type="button" 
                    class="btn   btn-small comment-button " 
                    data-bs-toggle="modal" 
                    data-bs-target="#commentModal-${movie.id}">
              Comment
            </button>

            <button type="button"  
                    class="btn  reservationBtn"  
                    id="${movie.id}" data-toggle="modal" data-target="#exampleModal-${movie.id}" >Reservations</button>
          </div>
        </div>
      </div>
    `;

    movieContainer.appendChild(movieCard);

    //  likes functionality
    const likeBtn = movieCard.querySelector('.likeBtn'); // Select the like button within the movie card
    let isLiked = false;
    likeBtn.addEventListener('click', async () => {
      if (isLiked) {
        // If already liked, subtract the like and change the symbol back
        likeBtn.innerHTML = '&#9825';
        isLiked = false;
        await getLikesForUnclick(movie.id);
      } else {
        // If not liked, add the like and change the symbol to ❤
        likeBtn.innerHTML = '❤️';
        isLiked = true;
        await postLikes(movie.id, likeApi);
        await getLikes(movie.id);
      }
    });
    // update UI on page load
    await getLikes(movie.id);

    // modal functionality
    const modal = document.createElement('div');
    modal.classList.add('modal', 'fade');
    modal.id = `commentModal-${movie.id}`;
    modal.setAttribute('aria-labelledby', `exampleModalCenterTitle-${movie.id}`);
    modal.setAttribute('aria-hidden', 'true');

    modal.innerHTML = `
    <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
         <div>
           <img src=${movie.image.medium} class=" image-fluid" alt="popup image">
         </div>
         <div><h3>${movie.name}</h3></div>
         <div  class="movieSummary">${movie.summary}</div>
         <div  class="afterSummary">
           <div><h4>Geners:${movie.genres.join(', ')}</h4> </div>
           <div><h4>Ratings: ${movie.rating.average}</h4></div>
           <div><h4>Premiered:${movie.premiered}</h4></div>
         </div>
         <div class="commentArea">


         </div>
         <div><span class="commentsCounter"></span></div>

         <div>
           <form  class="form">
           <h1>Comment</h1>
           
           <fieldset>
             <label for="name"></label>
             <input type="text"  placeholder="name" id="username-${movie.id}" name="username">
             
             <label for="comment"></label>
             <textarea name="comment" max="100" id="comment-${movie.id}" placeholder="Type comment"  rows="5"></textarea>
           </fieldset> 
           <button id="commentFormBtn-${movie.id}"  class="commentFormBtn"  btn" type="submit">Submit</button>
          
           </form>

         </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
  
  `;

    // Add event listener to the comment form
    const commentForm = modal.querySelector(`#commentFormBtn-${movie.id}`);
    commentForm.addEventListener('click', async (event) => {
      event.preventDefault();

      const username = modal.querySelector(`#username-${movie.id}`).value;
      const comment = modal.querySelector(`#comment-${movie.id}`).value;

      await postComment(commentApi, movie.id, username, comment);

      // Clear the form inputs
      modal.querySelector(`#username-${movie.id}`).value = '';
      modal.querySelector(`#comment-${movie.id}`).value = '';

      const comments = await fetchCommentsFromApi(movie.id);
      renderComments(modal, comments);
      const commentsCounter = modal.querySelector('.commentsCounter');
      const numComments = countComments(movie.id, comments);
      commentsCounter.textContent = `Comments: ${numComments}`;
    });

    document.body.appendChild(modal);
  });
  const reservationPopUp = document.getElementById('overlayForBody');
  const modalContainer = document.createElement('div');
  modalContainer.innerHTML = await modalContent(data);
  reservationPopUp.appendChild(modalContainer);
};

renderMovies();
