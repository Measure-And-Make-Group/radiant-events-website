export const CARD_URL = "https://www.radianteventsplanning.com/connect/rickya";
export const SHARE_URL = CARD_URL;
export const QR_URL = `${CARD_URL}?utm_source=qr&utm_medium=qr&utm_campaign=rickya_card`;
export const QR_IMAGE = "/connect/rickya/rickya-qr-v2.png";
export const REFERRAL_MESSAGE = `I’d love to introduce you to Rickya Fandino, founder of Radiant Events Planning. Here’s her card so you can connect! ${CARD_URL}`;
export const SMS_REFERRAL_URL = `sms:?&body=${encodeURIComponent(REFERRAL_MESSAGE)}`;
