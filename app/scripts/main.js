/// Pass props to listing component, specify template
let listing = Vue.extend({
  template: '#listing-template',
  props: ['reposInPage'],
  // Filters for formatting dates and truncating strings in template parsing
  filters: {
    timestamp: function(value) {
      return value.replace(/T|Z/g, ' ')
    },
    truncate: function (value, length) {
      if(value) {
        if(value.length < length) {
          return value
        }

        length = length - 3;

        return value.substring(0, length) + '...'
      }
     }
  }
});

// Props, template, methods to paginator component
let pagination = Vue.extend({
 template: '#pagination-template',
 props: ['page', 'totalPages'],
 // Methods to increase/decrease current page in state - synchronous with parent state
 methods: {
   decrement: function() {
     let self = this
     if (self.page > 1) {
       self.page--
     }
   },
   increment: function() {
     let self = this
     if (self.page < self.totalPages) {
       self.page++
     }
   }
 }
});

// Instantiate Vue, register components
let app = new Vue({

  el: '#app',

  data: {
    // API Query data
    query: 'vue',
    language: 'javascript',
    sort: 'stars',
    order: 'desc',
    requestIndex: 1,
    requestQuantity: 100,
    date: getLastWeek(),
    // Pagination data
    page: 1,
    perPage: 5,
    // API Response data
    totalReposFound: 0,
    allRepos: [],
    // Dev: Rate Limit object
    // rate: null
  },

  components: {
    'listing': listing,
    'pagination': pagination
  },

  // Data to watch
  watch: {
    cachedReposRemaining: 'expandRepoCache'
  },

  // Computed Data
  computed: {
    resourceUrl: function(){
      // Github API URL
      // Hardcoded - 100 per_page response length
      return 'https://api.github.com/search/repositories?q=' + this.query + '+language:' + this.language + '+created:>' + this.date + '&sort=' + this.sort + '&order=' + this.order + '&page=' + this.requestIndex + '&per_page=' + this.requestQuantity + ''
    },
    totalPages: function(){
      return Math.ceil(this.totalReposFound / this.perPage)
    },
    reposInPage: function() {
      // Slice cached Repos array to display pages
      if (this.page == 1) {
        // If first page, set first array param to 0 (zero-index)
        var firstRepo = 0
      }
      else {
        //find first item in page by counterbalancing page number to account for zero index, multiply by items per page
        var firstRepo = (this.page -1) * this.perPage
      }
      let lastRepo = firstRepo + this.perPage
      return this.allRepos.slice(firstRepo, lastRepo)
    },
    cachedReposRemaining: function() {
      // Countdown remaining cached repos to use as trigger for additional API requests
      return this.allRepos.length - (this.page * this.perPage)
    }
  },

  created: function () {
    // Grab as many arrays as possible on init
    this.getRepoCache()
  },

  methods: {

    getRepoCache: function () {
      let self = this
      let req = new XMLHttpRequest()

      req.open('GET', self.resourceUrl)

      req.onload = function () {
        let resPayload = JSON.parse(req.responseText)
        self.allRepos = self.allRepos.concat(resPayload.items)
        self.totalReposFound = resPayload.total_count

        self.allRepos.forEach(function(el, index, array) {
          el.ranking = index + 1
        });
      }

      // TODO: onerror handling

      req.send()

      // this.getRate()
    },

    expandRepoCache:function() {

      let self = this

      if (self.cachedReposRemaining <= (self.perPage * 1)) {
        self.requestIndex++
        self.getRepoCache()
      }
    },
    // Dev: Rate limit getter
    // getRate() {
    //   let req = new XMLHttpRequest()
    //
    //   req.open('GET', "//api.github.com/rate_limit")
    //
    //   req.onload = function () {
    //     let resPayload = JSON.parse(req.responseText)
    //     self.rate = resPayload
    //
    //   }
    //
    //   req.send()
    // }
  }
})


function getLastWeek() {
  let today = new Date()

  var lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  return lastWeek.toISOString()
}
