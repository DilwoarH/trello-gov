class index {
  constructor() {
    this.trelloService = new TrelloApiService();
    this.setAPIkey();
  }

  setAPIkey(){
    this.trelloService.setKey(window.trello_api_key);
  }
}

(function(){
  new index();
})();
