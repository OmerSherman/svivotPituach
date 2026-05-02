class User {
    constructor(userId, firstName, lastName, email, password, userRole) {
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.userRole = userRole; // admin/manager/user
        this.createDate = new Date().toISOString();
        this.updateDate = new Date().toISOString();
    }

    

    getFullName() {
        return this.firstName + ' ' + this.lastName;
    }

    isAdmin() {
        return this.userRole === 'admin';
    }
}

module.exports = User;

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