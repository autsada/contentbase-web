export default function CreateProfile() {
  return (
    <div className="page p-4 text-start">
      <form className="px-5">
        <p className="mb-5 text-lg">Please provide below information.</p>
        <fieldset className="mb-6 border border-borderDarkGray pl-4 rounded-md bg-white">
          <legend className="text-textExtraLight px-1">
            Handle
            <abbr title="This field is mandatory" aria-label="required">
              *
            </abbr>
          </legend>
          <label htmlFor="handle">
            <input
              type="text"
              name="handle"
              placeholder="What you would like to be called?"
              className="block w-full h-10 font-semibold text-blueDark text-lg outline-none placeholder:font-light placeholder:text-blue-400 placeholder:text-sm"
            />
          </label>
        </fieldset>

        <fieldset className="mb-6 border border-borderDarkGray pl-4 rounded-md bg-white">
          <legend className="text-textExtraLight px-1">Profile Image</legend>
          <label htmlFor="handle">
            <input
              type="text"
              name="handle"
              placeholder="What you would like to be called?"
              className="block w-full h-10 font-semibold text-blueDark text-lg outline-none placeholder:font-light placeholder:text-blue-400 placeholder:text-sm"
            />
          </label>
        </fieldset>

        <button type="submit" className="btn-dark w-40 rounded-full">
          Create Profile
        </button>
      </form>
    </div>
  )
}
