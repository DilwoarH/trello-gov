class TrelloApiService 
{
    constructor() {
        this.trello = window.Trello;
    }

    setKey(key) {
        return this.trello.setKey(key);
    }

    authorize(
        appName = "Trello service",
        scope = { read: true, write: false },
        success_callback = null, 
        error_callback = null
    ) {
        return this.trello.authorize({
            type: 'popup',
            name: appName,
            scope: scope,
            expiration: 'never',
            success: success_callback ? success_callback : this.authenticationSuccess,
            error: error_callback ? error_callback : this.authenticationFailure
        });
    }

    authenticationSuccess() {
        console.log('Successful authentication');
    }

    authenticationFailure() {
        console.log('Failed authentication');
    }

    isAuthorized() {
        return this.trello.authorized();
    }

    /* 
     * Create Board
     * Return Promise
     */
    createBoard( name = null ) {
        if (!name) return { "error": "No name given." };
        return this.trello.post(`/boards/?name=${name}`);
    }

    /* 
     * Get Board
     * Return Promise
     */
    getBoard( id = null ) {
        if (!id) return { "error": "No id given." };
        return this.trello.boards.get(id);
    }

    /* 
     * Get All Board
     * Return Promise
     */
    getAllBoard( user_id = null ) {
        if (!user_id) return { "error": "No user_id given." };
        return this.trello.get(`/members/${user_id}/boards`);
    }

    /* 
     * Get Lists for Board
     * Return Promise
     */
    getListsForBoard( id = null ) {
        if (!id) return { "error": "No id given." };
        return this.trello.boards.get(`${id}/lists`);
    }

    /* 
     * Get Labels for Board
     * Return Promise
     */
    getLabelsForBoard( id = null ) {
        if (!id) return { "error": "No id given." };
        return this.trello.boards.get(`${id}/labels`);
    }

    /* 
     * Get Cards For List
     * Return Promise
     */
    getCardsForList( id = null ) {
        if (!id) return { "error": "No id given." };
        return this.trello.lists.get(`${id}/cards`);
    }

    /* 
     * Create Card for list
     * Return Promise
     */
    createCardForList( list_id = null, name = null, description = null ) {
        if (!list_id || !name) return { "error": "Invalid data." };
        return this.trello.post(`/cards/?idList=${list_id}&name=${name}&desc=${description}`);
    }

    createChecklistsForCard( card_id, items )
    {
        if (!card_id || !items) return { "error": "Invalid data." };
        var name = "Actions / Useful content";
        var _this = this;
        this.trello.post(`/checklists/?idCard=${card_id}&name=${name}`)
        .then(function(checklist){
            items.forEach(item => {
                _this.trello.post(`/checklists/${checklist.id}/checkItems?name=${item}`);
            });
        });
    }
}
