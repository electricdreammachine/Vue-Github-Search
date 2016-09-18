"use strict";function getLastWeek(){var e=new Date,t=new Date(e.getTime()-6048e5);return t.toISOString()}var listing=Vue.extend({template:"#listing-template",props:["reposInPage"],filters:{timestamp:function(e){return e.replace(/T|Z/g," ")},truncate:function(e,t){if(e)return e.length<t?e:(t-=3,e.substring(0,t)+"...")}}}),pagination=Vue.extend({template:"#pagination-template",props:["page","totalPages"],methods:{decrement:function(){var e=this;e.page>1&&e.page--},increment:function(){var e=this;e.page<e.totalPages&&e.page++}}}),app=new Vue({el:"#app",data:{query:"vue",language:"javascript",sort:"stars",order:"desc",requestIndex:1,requestQuantity:100,date:getLastWeek(),page:1,perPage:5,totalReposFound:0,allRepos:[]},components:{listing:listing,pagination:pagination},watch:{cachedReposRemaining:"expandRepoCache"},computed:{resourceUrl:function(){return"https://api.github.com/search/repositories?q="+this.query+"+language:"+this.language+"+created:>"+this.date+"&sort="+this.sort+"&order="+this.order+"&page="+this.requestIndex+"&per_page="+this.requestQuantity},totalPages:function(){return Math.ceil(this.totalReposFound/this.perPage)},reposInPage:function(){if(1==this.page)var e=0;else var e=(this.page-1)*this.perPage;var t=e+this.perPage;return this.allRepos.slice(e,t)},cachedReposRemaining:function(){return this.allRepos.length-this.page*this.perPage}},created:function(){this.getRepoCache()},methods:{getRepoCache:function(){var e=this,t=new XMLHttpRequest;t.open("GET",e.resourceUrl),t.onload=function(){var a=JSON.parse(t.responseText);e.allRepos=e.allRepos.concat(a.items),e.totalReposFound=a.total_count,e.allRepos.forEach(function(e,t,a){e.ranking=t+1})},t.send()},expandRepoCache:function(){var e=this;e.cachedReposRemaining<=1*e.perPage&&(e.requestIndex++,e.getRepoCache())}}});