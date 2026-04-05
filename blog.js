// Page detection — no auth
if (document.getElementById('featured-section')) {
  loadBlog();
} else if (document.getElementById('post-content')) {
  loadPost();
}

function formatDate(dateStr) {
  var months = [
    'enero','febrero','marzo','abril','mayo','junio',
    'julio','agosto','septiembre','octubre','noviembre','diciembre'
  ];
  var d = new Date(dateStr + 'T12:00:00');
  return d.getDate() + ' de ' + months[d.getMonth()] + ' de ' + d.getFullYear();
}

function loadBlog() {
  // Set date
  var dateEl = document.getElementById('masthead-date');
  if (dateEl) {
    var now = new Date();
    var days = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
    var months = [
      'enero','febrero','marzo','abril','mayo','junio',
      'julio','agosto','septiembre','octubre','noviembre','diciembre'
    ];
    dateEl.textContent = days[now.getDay()] + ', ' + now.getDate() + ' de ' + months[now.getMonth()] + ' de ' + now.getFullYear();
  }

  fetch('posts.json')
    .then(function(res) { return res.json(); })
    .then(function(posts) {
      var featured = posts.find(function(p) { return p.featured; });
      var rest = posts.filter(function(p) { return !p.featured; });

      // Render featured
      var featuredSection = document.getElementById('featured-section');
      if (featured) {
        featuredSection.innerHTML =
          '<div class="featured-card" onclick="window.location.href=\'post.html?id=' + featured.id + '\'">' +
            '<div class="featured-left">' +
              '<span class="featured-label">Destacado</span>' +
              '<span class="featured-category">' + featured.category + '</span>' +
              '<h2>' + featured.title + '</h2>' +
              '<p class="featured-subtitle">' + featured.subtitle + '</p>' +
              '<p class="featured-excerpt">' + featured.excerpt + '</p>' +
            '</div>' +
            '<div class="featured-right">' +
              '<blockquote class="pull-quote">' + featured.pullQuote + '</blockquote>' +
            '</div>' +
          '</div>';
      }

      // Render grid
      renderGrid(rest);

      // Category filtering
      var allPosts = posts;
      document.getElementById('category-nav').addEventListener('click', function(e) {
        if (e.target.tagName !== 'A') return;
        e.preventDefault();

        // Update active state
        var links = document.querySelectorAll('.category-nav a');
        for (var i = 0; i < links.length; i++) {
          links[i].classList.remove('active');
        }
        e.target.classList.add('active');

        var category = e.target.getAttribute('data-category');
        var filtered;
        if (category === 'all') {
          filtered = allPosts.filter(function(p) { return !p.featured; });
          featuredSection.style.display = '';
        } else {
          filtered = allPosts.filter(function(p) { return p.category === category; });
          featuredSection.style.display = 'none';
        }
        renderGrid(filtered);
      });
    });
}

function renderGrid(posts) {
  var grid = document.getElementById('posts-grid');
  grid.innerHTML = posts.map(function(post) {
    return '<div class="post-card" onclick="window.location.href=\'post.html?id=' + post.id + '\'">' +
      '<div class="post-card-inner">' +
        '<div class="card-top"></div>' +
        '<span class="card-category">' + post.category + '</span>' +
        '<h3>' + post.title + '</h3>' +
        '<p class="card-subtitle">' + post.subtitle + '</p>' +
        '<p class="card-excerpt">' + post.excerpt + '</p>' +
        '<span class="card-date">' + formatDate(post.date) + '</span>' +
      '</div>' +
    '</div>';
  }).join('');
}

function loadPost() {
  var id = parseInt(new URLSearchParams(location.search).get('id'), 10);

  fetch('posts.json')
    .then(function(res) { return res.json(); })
    .then(function(posts) {
      var post = posts.find(function(p) { return p.id === id; });
      if (!post) {
        document.getElementById('post-content').innerHTML = '<p>Entrada no encontrada.</p>';
        return;
      }

      document.title = post.title + ' — El Diario de Daniel';

      document.getElementById('post-content').innerHTML =
        '<span class="post-category-tag">' + post.category + '</span>' +
        '<h1>' + post.title + '</h1>' +
        '<p class="post-meta">' + post.subtitle + ' &middot; ' + formatDate(post.date) + '</p>' +
        '<div class="post-body">' + post.content + '</div>';
    });
}
