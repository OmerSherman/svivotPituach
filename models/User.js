class User{
    constructor(id, name , email, pass_hash){
        this.id = id ;
        this.name = name;
        this.email = email;
        this.pass_hash = pass_hash;
        this.favorites = []
    }


    get_user_name(){
        return this.id;
    }
    set_user_name(name){
        this.name = name;
    }
    get_user_id(){
        return this.id;
    }
    get_mail(){
        return this.email;
    }
    get_hash_pass(){
        return this.pass;
    }

    get_favorites(){
        return this.favorites
    }
    
    add_attraction_to_favorites( attraction){
        this.favorites.push(attraction)
    }
}