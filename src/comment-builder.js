function makeThread(comment, parentDiv) {
  // Create the comment structure

  let commentDiv = document.createElement('div');
  commentDiv.setAttribute('class', 'ycomments-child')
  let date = new Date(comment.created_at);
  let dateString = date.toLocaleDateString() + ' - ' + date.toLocaleTimeString();
  let commentText = comment.text;
  let author = comment.author;
  if (!commentText || !author)
    return;
  let authorLink = "https://news.ycombinator.com/user?id=" + author;

  const commentHtml = `
    <div class="ycomments-content">
      <div class="ycomments-meta">
        <a class="ycomments-author" href="${authorLink}" target="_blank">${author}</a>
        <span>${dateString}</span>
        <a class="ycomments-toggle" onclick="onClickToggle(this)" >[-]</a>
      </div>
      <div class="ycomments-text">${commentText}</div>
    </div>
  `;
  commentDiv.insertAdjacentHTML('beforeend', commentHtml);
  // Add to parentDiv
  parentDiv.appendChild(commentDiv);
  for (const childComment of comment.children) {
    makeThread(childComment, commentDiv)
  }
}

function makeCommentsNode(comments) {
  let commentsRootDiv = document.createElement('div');
  commentsRootDiv.setAttribute("class", "ycomments-root")
  for (const comment of comments) {
    makeThread(comment, commentsRootDiv)
  }

  function onClickToggle(e) {
    const commentDiv = e.parentElement.parentElement.parentElement;
    if (e.innerText == '[-]') {
      commentDiv.style.height = '15px';
      e.innerText = '[+]';
    } else {
      commentDiv.style.height = 'unset';
      e.innerText = '[-]';
    }
  };

  const scriptString = `<script>${onClickToggle.toString()}</script>`
  commentsRootDiv.insertAdjacentHTML('beforeend', scriptString)
  return commentsRootDiv;
}

const isDev = !process.env.NODE_ENV || process.env.NODE_ENV !== 'production'
console.log('isDev:' + isDev)

const cssTxt = require('./main.css')
function getCssStyleElement() {
  let tag;
  if (isDev) {
    tag = document.createElement('link');
    tag.href = './dist/main.css';
    tag.rel = "stylesheet"; 
    tag.type = "text/css"; 
  } else {
    tag = document.createElement('style');
    tag.innerHTML = cssTxt;
  }
  return tag;
}

const svgIcon = require('./icon-white.svg')
function getSvgElement() {
  let tag;
  tag = document.createElement('div');
  tag.setAttribute('class', 'icon');
  let link = document.createElement('a');
  link.href = 'https://ycomments.benwinding.com/';  
  link.target = '_blank';
  link.innerHTML = svgIcon;
  tag.appendChild(link);
  return tag;
}

function makeIframe(itemObj) {
  const comments = itemObj.comments;
  const meta = itemObj.meta;
  let iframe = document.createElement('iframe');

  function onIframeLoaded() {
    var doc = iframe.contentWindow.document;
    doc.open();
    const node = makeCommentsNode(comments);
    // write comments, creates html structure
    doc.write(node.outerHTML);
    // add stylesheet to iframe head
    doc.head.appendChild(getCssStyleElement())

    // doc.head.appendChild(cssLink)
    let author = meta.author;
    let authorLink = "https://news.ycombinator.com/user?id=" + author;
    let title = meta.title;
    let id = meta.id;
    let titleLink = "https://news.ycombinator.com/item?id=" + id;

    const headerHtml = `
    <div>
      <h1 id="title">Discussion Source: <a href="${titleLink}" target="_blank">[&#x2197;] ${title}</a></h1>
      <p id="subtitle">by <a href="${authorLink}" target="_blank">${author}</a>
      <a href="${titleLink}" target="_blank">${itemObj.comments.length} comments</a>
      </p>
    </div>
    `;
    let headerDiv = document.createElement('div');
    headerDiv.setAttribute('class', 'ycomments-header');
    headerDiv.innerHTML = headerHtml;
    headerDiv.insertAdjacentElement('afterbegin', getSvgElement())
    doc.body.insertAdjacentElement('afterbegin', headerDiv)
    doc.close();

    iframe.style.WebkitTransition = 'opacity 1s';
    iframe.style.MozTransition = 'opacity 1s';
    iframe.style.height = '800px';//doc.body.scrollHeight + 'px';
    iframe.style.opacity = '1';
  }

  iframe.style.opacity = '0';
  iframe.setAttribute('name', 'ycomments');
  iframe.setAttribute('width', '100%');
  iframe.setAttribute('frameBorder', '0');
  // iframe.setAttribute('scrolling', 'no');
  iframe.addEventListener('load', onIframeLoaded);
  return iframe;
}

function makeIframeError() {
  let iframe = document.createElement('iframe');

  function onIframeLoaded() {
    var doc = iframe.contentWindow.document;
    doc.open();
    // write comments, creates html structure
    doc.write('<div></div>');
    // add stylesheet to iframe head
    doc.head.appendChild(getCssStyleElement())

    // doc.head.appendChild(cssLink)
    let url = window.location.href;
    let title = document.title;
    let submitlink = `https://news.ycombinator.com/submitlink?u=${url}&t=${title}`

    const headerHtml = `
    <div class="error">
      <p id="subtitle">No discussion found</p>
      <p id="subtitle"><a href="${submitlink}" target="_blank">Click here start one!</p>
    </div>
    `;
    let headerDiv = document.createElement('div');
    headerDiv.setAttribute('class', 'ycomments-header');
    headerDiv.innerHTML = headerHtml;
    headerDiv.insertAdjacentElement('afterbegin', getSvgElement())
    doc.body.insertAdjacentElement('afterbegin', headerDiv)
    doc.close();

    iframe.style.WebkitTransition = 'opacity 1s';
    iframe.style.MozTransition = 'opacity 1s';
    iframe.style.height = '50px';
    iframe.style.opacity = '1';
  }

  iframe.style.opacity = '0';
  iframe.setAttribute('name', 'ycomments');
  iframe.setAttribute('width', '100%');
  iframe.setAttribute('frameBorder', '0');
  iframe.setAttribute('scrolling', 'no');
  iframe.addEventListener('load', onIframeLoaded);
  return iframe;
}

module.exports = {
  makeIframe: makeIframe,
  makeIframeError: makeIframeError,
}

