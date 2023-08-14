import axios from "axios";
import { env } from "~/env.mjs";

interface User {
  id: string;
  login: string;
  display_name: string;
  broadcaster_type: string;
  profile_image_url: string;
}

interface Stream {
  id: string;
  game_name: string;
  title: string;
  thumbnail_url: string;
}

interface UserResponse {
  data: {
    data: User[];
  };
}

interface StreamResponse {
  data: {
    data: Stream[];
  };
}

const ACCESS_TOKEN = env.TWITCH_ACCESS_TOKEN;
const CLIENT_ID = env.TWITCH_CLIENT_ID;

const getUser = async (id: string) => {
  if (!ACCESS_TOKEN || !CLIENT_ID) {
    throw Error("Cannot fetch from Twitch due to invalid env vars!");
  }

  const req = await axios.get(`https://api.twitch.tv/helix/users?login=${id}`, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Client-Id": CLIENT_ID,
    },
  });
  return req as UserResponse;
};

const getUserStream = async (id: string) => {
  if (!ACCESS_TOKEN || !CLIENT_ID) {
    throw Error("Cannot fetch from Twitch due to invalid env vars!");
  }

  const request = await axios.get(
    `https://api.twitch.tv/helix/streams?user_login=${id}`,
    {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Client-Id": CLIENT_ID,
      },
    }
  );

  const req = request as StreamResponse;

  return req.data.data.shift();
};

export { getUser, getUserStream };
