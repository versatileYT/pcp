const { Telegraf } = require('telegraf');
const axios = require('axios');
const cheerio = require('cheerio');

const bot = new Telegraf('6337128227:AAEeyx6BTfdiAUO1f-tvLxA-5pI3_fcc2LE');

let previousInfo = 'Informujemy, iż Podlaski Urząd Wojewódzki nie prowadzi obecnie rejestracji zgłoszeń w celu złożenia wniosku o przyznanie Karty Polaka.'; // Предыдущая информация с веб-страницы

async function fetchPageInfo() {
    try {
        const response = await axios.get('https://www.gov.pl/web/uw-podlaski/karta-polaka');
        const html = response.data;
        const $ = cheerio.load(html);
        // Найти и извлечь необходимую информацию из HTML-кода
        const info = $('#main-content').text().trim(); // Измените '.selector-for-info' на ваш селектор
        return info;
    } catch (error) {
        console.error('Error fetching page info:', error);
        return null;
    }
}

async function checkForChanges(ctx) {
    const currentInfo = await fetchPageInfo();
    if (currentInfo !== null && currentInfo.indexOf(previousInfo) == -1) {
        // Отправить уведомление в Telegram, если информация изменилась
        return ctx.reply(`Изменения на странице! https://www.gov.pl/web/uw-podlaski/karta-polaka`);
    } else {
        return ctx.reply('Нет изменений на странице.');
    }
}

// Обработчик команды /check
bot.command('check', checkForChanges);

// Обработчик команды /menu
bot.command('menu', (ctx) => {
    // Отправляем сообщение с меню
    return ctx.reply('Выберите действие:', Markup.inlineKeyboard([
        Markup.button.callback('Проверить изменения', 'check')
    ]).extra());
});

// Регулярно проверять наличие изменений (каждые 12 часов)
setInterval(checkForChanges, 60 * 1000);

// Запускаем бот
bot.launch();
