class MainController {
  static main = async (req, res, next) => {
    try {
      res.render('index', { data: { hello: 'hello' } });
    } catch (e) {
      next(e);
    }
  };
}

export default MainController;
