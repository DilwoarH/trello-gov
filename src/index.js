class index {
  constructor() {
    this.trelloService = new TrelloApiService();
    this.setAPIkey();
    this.auth();
    if ((this.cacheData = this.getCache())) {
      this.displayBoard();
    } else {
      this.initBoardSelection();
      this.cacheData = null;
    }
  }

  setAPIkey() {
    var key = window.localStorage.getItem('trello_api_key');
    return this.trelloService.setKey(key);
  }

  auth() {
    return this.trelloService.authorize("Objectives spreadsheet");
  }

  initBoardSelection() {
    var $boardSelectionWrapper = $('.board-selection');
    var $boardSelectElement = $('#board');

    this.initBoardSelectionListener($boardSelectElement);

    var user_id = window.localStorage.getItem('trello_user_id');
    this.trelloService.getAllBoard(user_id).then(function(boards){
      boards.forEach(board => {
        $boardSelectElement.append(`<option value='${board.id}'>${board.name}</option>`);
      });

      $boardSelectionWrapper.show();
    });
  }

  initBoardSelectionListener( $boardSelectElement ) {
    var _this = this;
    $boardSelectElement.on('change', function(){
      var board_id = $(this).val();
      _this.initCache(board_id);
    });
  }

  initCache(board_id) {
    var _this = this;

    this.cacheData = {
      board: {},
      lists: [],
      labels: [],
      cards_for_lists: {} 
    };

    var promises = [];

    promises.push( new Promise(function(resolve, reject) {
      _this.trelloService.getBoard(board_id)
      .then(function(board_data){
        _this.cacheData.board = board_data;
        resolve(board_data);
      });
    }) );

    promises.push( new Promise(function(resolve, reject){
      _this.trelloService.getListsForBoard(board_id)
      .then(function(lists) {
        _this.cacheData.lists = lists;
        resolve(lists);
      });
    }));

    promises.push( new Promise(function(resolve, reject){
      _this.trelloService.getLabelsForBoard(board_id)
      .then(function(labels) {
        _this.cacheData.labels = labels;
        resolve(labels);
      });
    }));


    Promise.all(promises)
    .then(function(values) {
      console.log(values);
      console.log(_this.cacheData);
      return Promise.resolve(values[1]);
    })
    .then(function(lists){
      var cardPromises = [];

      lists.forEach(list => {
        var _list_id = list.id;
        cardPromises.push( new Promise(function(resolve, reject){
          _this.trelloService.getCardsForList(_list_id).then(function(cards){
            _this.cacheData.cards_for_lists[_list_id] = cards;
            resolve(cards);
          })
        }));
      });

      Promise.all(cardPromises)
      .then(function(){
        _this.setCache();
        _this.displayBoard();
      });

    });
  }

  setCache() {
    window.localStorage.setItem('cache', JSON.stringify(this.cacheData));
  }

  getCache() {
    return JSON.parse( window.localStorage.getItem('cache'));
  }

  displayBoard() {
    var data = this.getCache();
    var $elm = $('#main-content');
    $elm.find('.board-name').text(data.board.name);

    var tabs = '';
    var tab_content = '';

    data.lists.forEach(list => {
      var cards = '';
      data.cards_for_lists[list.id].forEach(card => {
        var labels = '';

        card.labels.forEach(label =>{
          labels += `
            <strong class="govuk-tag govuk-!-margin-bottom-1" style="${label.name.includes('Q') ? "background-color: #d53880" : "" }">
             ${label.name}
            </strong>
          `;
        });

        cards += `
        <tr class="govuk-table__row">
          <td class="govuk-table__cell">${card.name}</td>
          <td class="govuk-table__cell">${labels}</td>
          <td class="govuk-table__cell"><a href="${card.url}" target="_blank">View</a></td>
        </tr>
        `
      });

      tabs += `
      <li class="govuk-tabs__list-item">
          <a class="govuk-tabs__tab govuk-tabs__tab--selected" href="#list-${list.id}">
            ${list.name}
          </a>
        </li>
      `;

      tab_content += `
        <section class="govuk-tabs__panel govuk-tabs__panel--hidden" id="list-${list.id}">
          <h2 class="govuk-heading-l">${list.name}</h2>
          <table class="govuk-table">
            <thead class="govuk-table__head">
              <tr class="govuk-table__row">
                <th class="govuk-table__header" scope="col">Name</th>
                <th class="govuk-table__header" scope="col">Labels</th>
                <th class="govuk-table__header" scope="col">Trello</th>
              </tr>
            </thead>
            <tbody class="govuk-table__body">
              ${cards}
            </tbody>
          </table>
        </section>
      `;
    });

    $elm.append(`
    <div class="govuk-tabs" data-module="tabs">
      <h2 class="govuk-tabs__title">
        Contents
      </h2>
    
      <ul class="govuk-tabs__list govuk-!-margin-bottom-6">
        ${tabs}
      </ul>

      ${tab_content}
    </div>
    `);
  }
}

(function(){
  new index();
})();
