import ajax from "lib/ajax";

export default class Message {
  get_page(data){
    return ajax.get('/msg/message/get_my_page',data)
  }
  read(ids){
      return ajax.post('/msg/message/read',{
          ids:ids.join(',')
      })
  }
  get_unread_count(){
    return ajax.get("/msg/message/get_unread_count");
  }
 
}
