import React from 'react';
import BookingSearch from './BookingSearch';
import WhatsAppChat from './WhatsAppChat';
const Home = ({user, onRequireLogin}) => {
  return (
    <div>
    <BookingSearch 
    user={user} 
    onLoginClick={onRequireLogin}/>
    <WhatsAppChat />
    </div>
  )
}

export default Home
