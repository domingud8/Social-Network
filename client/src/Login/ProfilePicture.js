const DEFAULT_PROFILE_PICTURE = "./avatar.png";

export function ProfilePicture({ fname, sname, profile_picture_url, onClick }) {
    function onLabelClick(event) {
        event.preventDefault();
        onClick();
    }
    return (
        <img
            className="picture-comp"
            onClick={onLabelClick}
            src={profile_picture_url || DEFAULT_PROFILE_PICTURE}
            alt={`${fname} ${sname}`}
        />
    );
}
