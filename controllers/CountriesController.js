// import Countries from "../models/Countries";

class CountriesController {
  static list = async (req, res, next) => {
    try {
      // const countries = await Countries.getAll(s);

      res.json({
        status: 'ok',
        // countries,
      });
    } catch (e) {
      next(e);
    }
  };
}

export default CountriesController;
