"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** Show favorites list on click on "favorites" */

function navFavoritesClick(evt) {
  console.debug("navFavoritesClick", evt);
  hidePageComponents();
  const stories = currentUser.favorites
  if (currentUser.favorites.length === 0) {
    $allStoriesList.empty();
    const $empty = $(`<p>No favorites added!</p>`)
    $allStoriesList.append($empty);
    $allStoriesList.show();
  } else {
    console.log('in putStories')
    putStoriesOnPage(stories)
  }
}

$navFavorites.on("click", navFavoritesClick);

function navMyStoriesClick(evt) {
  console.debug("navMyStoriesClick", evt);
  hidePageComponents();
  const stories = currentUser.ownStories
  if (currentUser.ownStories.length === 0) {
    $allStoriesList.empty();
    const $empty = $(`<p>You haven't added any stories!</p>`)
    $allStoriesList.append($empty);
    $allStoriesList.show();
  } else {
    putStoriesOnPage(stories)
    for (let child of $allStoriesList.children()) {
      const $trashCan = $('<i class="fa-solid fa-trash-can"></i>')
      $trashCan.on('click', removeStoryClick)
      $(child).prepend($trashCan)
    }
  }
}

$navMyStories.on("click", navMyStoriesClick);

async function removeStoryClick(evt) {
  evt.stopPropagation();
  const storyId = evt.target.parentElement.id;
  console.log(storyId);
  await currentUser.removeStory(currentUser, storyId);
  evt.target.parentElement.remove()
  const response = await axios({
    url: `${BASE_URL}/users/${currentUser.username}`,
    method: "GET",
    params: { token: currentUser.loginToken },
  })
  currentUser.ownStories = response.data.user.stories.map(s => new Story(s));
  if (currentUser.ownStories.length === 0) {
    const $empty = $(`<p>You haven't added any stories!</p>`)
    $allStoriesList.append($empty);
  }
  currentUser.favorites = currentUser.favorites.filter(s => s.storyId !== storyId);
  storyList.stories = storyList.stories.filter(s => s.storyId !== storyId);
}


/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $navLogin.hide();
  $navLogOut.show();
  $navLoggedIn.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/** Show submit form on click on "submit" */

function navSubmitClick(evt) {
  console.debug("navSubmitClick", evt);
  $submitForm.slideDown();
}

$navSubmit.on("click", navSubmitClick);