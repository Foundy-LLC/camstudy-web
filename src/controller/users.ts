interface setProfile {
    "name": string,
    "introduce": string | null | undefined,
    "tags":Array<string>
}

export default function setProfile(req:setProfile){
    console.log(req);
}