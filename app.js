
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const request = require('request');
//var bot = new TelegramBot(token,{polling:true});
//var request = require('request');

// Telegram's токен
const token = '987122839:AAFn3Dq-GeCzmBUxhQLcIkNzMKuNicu7h4Y';

//OpenWeatherMap API ключ
const appID = '34f820f33bf9cb9fcccdc51b8be99015';

// Кінцева точка OpenWeatherMap для отримання погоди за назвою міста
const weatherEndpoint = (city) => (
  `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&&appid=${appID}`
);

//URL-адреса, яка містить піктограму відповідно до погоди
const weatherIcon = (icon) => `http://openweathermap.org/img/w/${icon}.png`;

// Шаблон реакції на погоду
const weatherHtmlTemplate = (name, main, weather, wind, clouds) => (
  `Прогноз погоди в <b>${name}</b>:
<b>${weather.main}</b> - ${weather.description}
Температура: <b>${main.temp} °C</b>
Тиск: <b>${main.pressure} hPa</b>
Вологість: <b>${main.humidity} %</b>
Вітер: <b>${wind.speed} meter/sec</b>
Хмари: <b>${clouds.all} %</b>
`
);

// Створений екземпляр TelegramBot
const bot = new TelegramBot(token, {
  polling: true
});

//Функція, яка отримує погоду за назвою міста
const getWeather = (chatId, city) => {
  const endpoint = weatherEndpoint(city);

  axios.get(endpoint).then((resp) => {
    const {
      name,
      main,
      weather,
      wind,
      clouds
    } = resp.data;

    bot.sendPhoto(chatId, weatherIcon(weather[0].icon))
    bot.sendMessage(
      chatId,
      weatherHtmlTemplate(name, main, weather[0], wind, clouds), {
        parse_mode: "HTML"
      }
    );
  }, error => {
    console.log("error", error);
    bot.sendMessage(
      chatId,
      `Оупс ... я не міг отримати погоду <b>${city}</b>`, {
        parse_mode: "HTML"
      }
    );
  });
}

// Listener (handler) for telegram's /weather event
bot.onText(/\/weather/, (msg, match) => {
  const chatId = msg.chat.id;
  const city = match.input.split(' ')[1];

  if (city === undefined) {
    bot.sendMessage(
      chatId,
      `Укажіть назву міста"/weather місто "`
    );
    return;
  }
  getWeather(chatId, city);
});

// Слухач (обробник) для події телеграми / запуску
// Ця подія сталася, коли ви починаєте розмову з обома вперше
// Надайте список доступних команд
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `Ласкаво просимо на <b> MultifunctionalBot </b>, дякую за використання моєї послуги
    
    Доступні команди:

/movie <b> фільм </b> - показує інформацію про вибраний вами фільм
/weather <b> місто </b> - показує погоду для вибраного <b> міста </b>
/curse - показує <b> курс валюти </b>  який ви виберете 
  `, {
      parse_mode: "HTML"
    }
  );
});
bot.onText(/\/curse/, (msg, match) => {

  const chatId = msg.chat.id;

  bot.sendMessage(chatId, 'Виберіть валюту, яка вас цікавить', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '€ - EUR',
            callback_data: 'EUR'
          }, {
            text: '$ - USD',
            callback_data: 'USD'
          }, {
            text: '₽ - RUR',
            callback_data: 'RUR'
          }, {
            text: '₿ - BTC',
            callback_data: 'BTC'
          }
        ]
      ]
    }
  });
});

bot.on('callback_query', query => {
  const id = query.message.chat.id;

  request('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5', function (error, response, body) {
    const data = JSON.parse(body);
    const result = data.filter(item => item.ccy === query.data)[0];
    const flag = {
      'EUR': '🇪🇺',
      'USD': '🇺🇸',
      'RUR': '🇷🇺',
      'UAH': '🇺🇦',
      'BTC': '₿'
    }
    let md = `
      *${flag[result.ccy]} ${result.ccy} 💱 ${result.base_ccy} ${flag[result.base_ccy]}*
      Купівля: _${result.buy}_
      Продажа: _${result.sale}_
    `;
    bot.sendMessage(id, md, {parse_mode: 'Markdown'});
  })
})


bot.onText(/\/movie (.+)/,function(msg,match){
  var movie = match[1];
  var chatId = msg.chat.id;
  request(`http://www.omdbapi.com/?apikey=33dcec48&t=${movie} `,function(error,response, body){
if (!error && response.statusCode == 200){
var res =JSON.parse(body);
 //bot.sendPhoto(chatId, res.Poster,{caption: 'Результат:' + res.Title })
  bot.sendPhoto(chatId,  res.Poster,{ caption:'Результат: \nНазва: '+ res.Title + '\nРік: ' + res.Year+ '\nОцінений: ' + res.Rated + '\nВипущено: '+ res.Released + '\nЧас виконання: '+ res.Runtime +'\nЖанр: '+ res.Genre })

}
  });
})

