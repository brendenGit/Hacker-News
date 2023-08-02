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
  return $(`
      <li id="${story.storyId}">
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

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $story.on("click", favoriteStoryClick);
    $allStoriesList.append($story);
  }
  $allStoriesList.show();
}

async function submitNewStory(evt) {
  console.debug("submitNewStory", evt);
  evt.preventDefault();

  const author = $("#author-name").val();
  const title = $("#story-title").val();
  const url = $("#story-url").val();

  const newStory = {title, author, url}
  await storyList.addStory(currentUser, newStory)
  putStoriesOnPage()

  $submitForm.trigger("reset");
  $submitForm.slideUp();
}

$submitForm.on("submit", submitNewStory);


async function favoriteStoryClick(evt) {

  const storyId = evt.target.id
  await currentUser.addFavorite(currentUser, storyId)

}