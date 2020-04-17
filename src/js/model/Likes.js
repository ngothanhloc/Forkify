export default class Likes {
    constructor(){
        this.likes =[];

    }

    addLike(id, title, author, img){
        const like = {id, title, author, img};
        this.likes.push(like);

        // Persit data in LocalStorage
        this.persisData();
        return like;

    }

    deleteLike(id){
        const index = this.likes.findIndex(el => el.id ===id);
        this.likes.splice(index, 1);
        
    }

    isLiked(id){
        return this.likes.findIndex(el => el.id === id) !== -1;
    }

    getNumLikes(){
        return this.likes.length;
    }

    persisData(){
        localStorage.setItem('like',JSON.stringify(this.likes));
    }

    readStorage(){
        const storage = JSON.parse(localStorage.getItem('like'));
        // Restoring likes from the localStorage
        if(storage) this.likes = storage;

    }

}