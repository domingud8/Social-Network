export function FormPictureModal({ onSubmitUploadPicture }) {
    function onFormModalSubmit(event) {
        event.preventDefault();
        const file = event.target.profile_picture.files[0];
        const body = new FormData();
        body.append("profile_picture", file);
        fetch("/api/users/me/picture", {
            method: "POST",
            body,
        })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                if (data.error_message) {
                    console.log(data.error_message);
                    alert("Error uploading profile picture");
                    return;
                }
                onSubmitUploadPicture(data.profile_picture_url);
            });
    }
    return (
        <form className="modal-cont" onSubmit={onFormModalSubmit}>
            <label>
                Select file
                <input
                    type="file"
                    accept="image/*"
                    name="profile_picture"
                    required
                />
            </label>
            <button className="btn" type="submit">
                Submit
            </button>
        </form>
    );
}
