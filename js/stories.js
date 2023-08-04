"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  let favoriteStatus;
  if (!currentUser) {
    favoriteStatus = document.createElement('i');
  } else if (currentUser.favorites.some(s => s.storyId === story.storyId)) {
    favoriteStatus = document.createElement('i');
    favoriteStatus.classList.add('fa-solid', 'fa-star');
  } else {
    favoriteStatus = document.createElement('i');
    favoriteStatus.classList.add('fa-regular', 'fa-star');
  }


  return $(`
      <li id="${story.storyId}">
        ${favoriteStatus.outerHTML}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

async function putStoriesOnPage(stories) {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  if (stories) {
    console.log('entered stories')
    for (let story of stories) {
      const $story = generateStoryMarkup(story);
      $story.on("click", toggleFavorite);
      $allStoriesList.append($story);
    }
  } else {
    for (let story of storyList.stories) {
      const $story = generateStoryMarkup(story);
      $story.on("click", toggleFavorite);
      $allStoriesList.append($story);
    }
  }

  $allStoriesList.show();
}

async function submitNewStory(evt) {
  console.debug("submitNewStory", evt);
  evt.preventDefault();

  const author = $("#author-name").val();
  const title = $("#story-title").val();
  const url = $("#story-url").val();

  const newStory = { title, author, url }
  await storyList.addStory(currentUser, newStory)
  putStoriesOnPage()

  $submitForm.trigger("reset");
  $submitForm.slideUp();
}

$submitForm.on("submit", submitNewStory);


async function toggleFavorite(evt) {
  const storyId = evt.currentTarget.id;
  const isFavorite = evt.target.classList.contains('fa-solid')
  if ((evt.target.nodeName === 'I')) {
    if (isFavorite) {
      evt.target.classList.remove('fa-solid')
      evt.target.classList.add('fa-regular')
    } else {
      evt.target.classList.remove('fa-regular')
      evt.target.classList.add('fa-solid')
    }
    await currentUser.addOrRemoveFavorite(currentUser, storyId, isFavorite)
  }
  const response = await axios({
    url: `${BASE_URL}/users/${currentUser.username}`,
    method: "GET",
    params: { token: currentUser.loginToken },
  })
  currentUser.favorites = response.data.user.favorites.map(s => new Story(s));
}