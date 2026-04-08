<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PayController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CardController;
use App\Http\Controllers\Api\CoinController;
use App\Http\Controllers\Api\LinkController;
use App\Http\Controllers\Api\LoanController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WalletController;
use App\Http\Controllers\Api\PackageController;
use App\Http\Controllers\Api\InterestController;
use App\Http\Controllers\Api\TransferController;
use App\Http\Controllers\Api\CategorieController;
use App\Http\Controllers\Api\BankAccountController;
use App\Http\Controllers\Api\DropshippingController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\StripeController;
use App\Http\Controllers\Api\WithdrawalController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });

Route::prefix('auth')->name('user.')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [UserController::class, 'store']);
    Route::middleware('jwt.verify')->get('/logout', [AuthController::class, 'logout']);
    Route::middleware('jwt.verify')->get('/current_user', [AuthController::class, 'getUser']);
});

Route::middleware('basic.authentication')->prefix('v1/tpago')->name('tpago')->group(function () {
    Route::post('/', [PayController::class, 'tpagoCallback']);
});
Route::get('/get-users', [UserController::class, 'index']);
Route::post('/updateMasive', [UserController::class, 'massive']);
Route::post('/v1/dropaccount', [DropshippingController::class, 'addDropshippingAccount']);
Route::post('/v1/test', [StripeController::class, 'getPriceIdOfPlan']);
Route::prefix('/v1/stripe/')->group(function () {
    Route::post('/verify-payment', [StripeController::class, 'verifyAndCreditWallet']);
    Route::post('/create-payment-intent', [StripeController::class, 'createPaymentIntent']);
    Route::post('/create-setup-intent-link', [StripeController::class, 'createSetupIntentLink']);
    Route::post('/create-subscription', [StripeController::class, 'createSubscriptionLink']);
});




// Route::post('/create_wallet', [UserController::class, 'storeWallet']);

// Route::post('/add/phoneNumber', [UserController::class, 'addNumber']);


Route::middleware('jwt.verify')->prefix('user')->name('user.')->group(function () {
    Route::get('/', [UserController::class, 'index']);
    Route::get('/get/{id}', [UserController::class, 'getUserById']);
    Route::get('/getBySearch', [UserController::class, 'getUsersBySearch']);
    Route::get('/all', [UserController::class, 'allUsers']);
    Route::get('/loan', [UserController::class, 'usersWithActiveLoan']);
    Route::get('/cleanUser', [UserController::class, 'cleanUser']);
    Route::get('/slowPayer', [UserController::class, 'slowPayerUser']);
    Route::get('/payPendigs', [UserController::class, 'paysPendingByUser']);

    Route::post('/u/{id}', [UserController::class, 'updateUser']);
    Route::post('/sendPhoneCode', [UserController::class, 'sendMobileVerifyCode']);
    Route::post('/verifyPhoneCode', [UserController::class, 'verifyPhoneNumber']);
    Route::post('/set-status/{id}', [UserController::class, 'setStatus']);
    Route::post('/set-block/{id}', [UserController::class, 'setBlock']);
    Route::post('/delete/{id}', [UserController::class, 'deleteUser']);
    Route::post('/restore/{id}', [UserController::class, 'restoreUser']);
    Route::post('/kyc', [UserController::class, 'setKyc']);
    Route::post('/setNewVerifyStatus', [UserController::class, 'setNewVerifyStatus']);
    Route::post('/email_prueba/{id}', [LoanController::class, 'sendeEmail']);
    Route::get('/get_notifications', [UserController::class,'getNotificationsUser']);
    Route::post('/setStatusNotShow', [UserController::class, 'setStatusNotShow']);
});


Route::middleware('jwt.verify')->prefix('notifications')->name('notification.')->group(function () {
    Route::post('/', [NotificationController::class, 'storeNotification']);
    Route::get('/{id}', [NotificationController::class, 'getAllByUser']);
    Route::get('/seeAll/{id}', [NotificationController::class, 'seeAllByUser']);
});
Route::middleware('jwt.verify')->prefix('deposit')->name('deposit.')->group(function () {
    Route::get('/pendigs', [PayController::class, 'getDepositPendigs']);
    Route::get('/byUser/{id}', [PayController::class, 'storeNotification']);
});

Route::middleware('jwt.verify')->prefix('banks')->name('bank.')->group(function () {
    Route::get('/', [BankAccountController::class, 'getBanks']);
});

Route::middleware('jwt.verify')->prefix('accounts_bank')->name('accountsBank.')->group(function () {
    Route::post('/', [BankAccountController::class, 'storeAccountBank']);
    Route::get('/{id}', [BankAccountController::class, 'getAccountsBanksByUser']);
    Route::post('/{id}', [BankAccountController::class, 'updateAccountBank']);
    Route::get('/delete/{id}', [BankAccountController::class, 'destroyAccountBank']);
});

Route::middleware('jwt.verify')->prefix('loan')->name('loan.')->group(function () {
    Route::post('/', [LoanController::class, 'storeLoan']);
    Route::get('/{id}', [LoanController::class, 'getActiveLoan']);
    Route::get('/get/{id}', [LoanController::class, 'getLoanById']);
    Route::get('/approve/get', [LoanController::class, 'getApproveLoan']);
    Route::post('/changeStatus/{id}', [LoanController::class, 'changeStatus']);
    Route::get('/getloan/pending', [LoanController::class, 'getPendingCount']);
});

Route::middleware('jwt.verify')->prefix('wallet')->name('wallet.')->group(function () {
    Route::get('/{id}', [WalletController::class, 'getWalletByNumber']);
    Route::post('/link', [WalletController::class, 'activateLinkWallet']);
    Route::post('/s/plan', [WalletController::class, 'setPlan']);
    Route::post('/setStatus', [WalletController::class, 'setStatus']);
});

Route::middleware('jwt.verify')->prefix('link')->group(function () {
    Route::post('/', [LinkController::class, 'store']);
    Route::post('/dropshipping', [LinkController::class, 'createLinkDropshipping']);
    Route::get('/dropshipping/byId/{id}', [LinkController::class, 'getDropshippingLinkById']);
    Route::get('/lastFive/{id}', [LinkController::class, 'getByUserLast5']);
    Route::get('/byUser/{id}', [LinkController::class, 'getByUser']);
    Route::get('/byId/{id}', [LinkController::class, 'getById']);
    Route::get('/byCode/{id}', [LinkController::class, 'getByCode']);
    Route::post('/pay/setStatus', [LinkController::class, 'setPayStatus']);
});

Route::prefix('link-public')->group(function () {
    Route::get('/byCode/{id}', [LinkController::class, 'getByCode']);
    Route::get('/dropshipping/byCode/{id}', [LinkController::class, 'getDropshippingLinkByCode']);
});
Route::prefix('v1/public')->group(function () {
    Route::post('/sendmail', [PayController::class, 'sendMail']);
});
Route::middleware('jwt.verify')->prefix('v1/stripe')->group(function () {
    Route::get('/payments/setup-intent', [StripeController::class, 'createSetupIntent']);
    Route::post('/payments/subscribe', [StripeController::class, 'subscribe']);
});
Route::prefix('v1/email')->group(function () {
    Route::get('/', [LoanController::class, 'sendMailx']);
});
Route::middleware('jwt.verify')->prefix('card')->name('card.')->group(function () {
    Route::post('/', [CardController::class, 'linkCard']);
    Route::get('/{id}', [CardController::class, 'getLinkCard']);
    Route::post('/delete/{id}', [CardController::class, 'deleteCard']);
    Route::post('/changeStatus/{id}', [CardController::class, 'changeStatus']);
});


Route::middleware('jwt.verify')->prefix('dropshipping')->name('dropshipping.')->group(function () {
    Route::get('/stadistics/{id}', [DropshippingController::class, 'getStadisticAndProfitByUser']);
    Route::post('/pay-activate', [DropshippingController::class, 'payActivate']);
    Route::get('/pay/byId/{id}', [PayController::class, 'getDropshippingPayById']);
    Route::get('/pay/byUser/{id}', [DropshippingController::class, 'getDropPayByUser']);
});
Route::middleware('jwt.verify')->prefix('transaction')->name('transacction.')->group(function () {
    Route::get('/all/{id}', [TransactionController::class, 'getTrasactionByUser']);
    Route::get('/byType/{type}/{id}', [TransactionController::class, 'getTrasactionByType']);
    Route::get('/print/{type}/{id}', [TransactionController::class, 'printTransaction']);
    Route::post('/', [TransactionController::class, 'createTransfer']);
});
Route::prefix('transaction-public')->name('transacction.public.')->group(function () {
    Route::get('/byType/{type}/{id}', [TransactionController::class, 'getTrasactionByType']);
    Route::get('/print/{type}/{id}', [TransactionController::class, 'printTransaction']);
});
Route::middleware('jwt.verify')->prefix('interest')->name('interest.')->group(function () {
    Route::get('/', [InterestController::class, 'getInterestRate']);
    Route::post('/', [InterestController::class, 'storeInterestRate']);
    Route::post('/{type}', [InterestController::class, 'updateInterestRate']);
});

Route::middleware('jwt.verify')->prefix('categories')->name('categorie.')->group(function () {
    Route::get('/', [CategorieController::class, 'getAll']);
    Route::get('/simple', [CategorieController::class, 'getAllSimple']);
    Route::post('/', [CategorieController::class, 'storeCategorie']);
    Route::post('/massive', [CategorieController::class, 'storeMassiveCategorie']);
    Route::get('/all/input', [CategorieController::class, 'getAllToSelect']);
    Route::get('/mostprolifict', [CategorieController::class, 'getMostProlifict']);
    Route::get('/delete-all', [CategorieController::class, 'deleteAll']);
});

Route::middleware('jwt.verify')->prefix('products')->name('product.')->group(function () {
    Route::get('/Bycategory/{category}', [ProductController::class, 'getAllProductsByCategory']);
    Route::get('/search', [ProductController::class, 'getAllProductsBySearch']);
    Route::get('/all/inventory/', [ProductController::class, 'getAllProductsInInventory']);
    Route::get('/all/my-products/', [ProductController::class, 'getAllMyProducts']);

    Route::get('/byId/{id}', [ProductController::class, 'getProductById']);
    Route::get('/similar', [ProductController::class, 'getSimilarProduct']);
    Route::get('/all', [ProductController::class, 'getAllProducts']);
    Route::post('/', [ProductController::class, 'storeProduct']);
    Route::post('/massive/{categoryId}', [ProductController::class, 'storeMassiveProducts']);
    Route::get('/profile/stats', [ProductController::class, 'statsProfile']);

    Route::get('/delete-all', [ProductController::class, 'deleteAll']);
});

Route::middleware('jwt.verify')->prefix('coins')->name('coins.')->group(function () {
    Route::get('/', [CoinController::class, 'index']);
    Route::get('/getById/{id}', [CoinController::class, 'getCoinById']);
    Route::post('/update/{id}', [CoinController::class, 'updateCoin']);
    Route::post('/delete/{id}', [CoinController::class, 'deleteCoin']);
});

Route::middleware('jwt.verify')->prefix('pay')->name('pay.')->group(function () {
    Route::post('/', [PayController::class, 'storePay']);
    Route::post('/link', [PayController::class, 'storePayLink']);
    Route::get('/byId/{id}', [PayController::class, 'getById']);
    Route::get('/byTrx/{trx}', [PayController::class, 'getByTrx']);

    Route::post('/get_url', [PayController::class, 'payRequest']);
    Route::post('/change-status/{id}', [PayController::class, 'changeStatus']);
    Route::get('/pays_pending', [PayController::class, 'getPayPendings']);
    Route::get('/pays_pending/by-user', [PayController::class, 'getPayPendingsByUser']);

    Route::get('/pays_dropshipping', [PayController::class, 'getPayDropshipping']);
    Route::post('/dropshpping/change-status/{id}', [PayController::class, 'changeStatusDropPay']);
});

Route::prefix('pay-public')->name('pay.link.')->group(function () {
    Route::post('/link', [PayController::class, 'storePayLink']);
    Route::post('/dropshipping/link', [PayController::class, 'storePayLinkDropshipping']);
});


Route::middleware('jwt.verify')->prefix('balance')->name('balance.')->group(function () {
    Route::get('/{id}', [WalletController::class, 'allBalances']);
    Route::post('/increments/{id}', [WalletController::class, 'incrementsWallet']);
    Route::post('/admin', [WalletController::class, 'setNewAdminCapital']);
});

Route::middleware('jwt.verify')->prefix('package')->name('package.')->group(function () {
    Route::get('/', [PackageController::class, 'getPackage']);
    Route::get('/byId/{id}', [PackageController::class, 'getPackageById']);
});

Route::middleware('jwt.verify')->prefix('withdrawal')->group(function () {
    Route::post('/', [WithdrawalController::class, 'store']);
    Route::get('/all', [WithdrawalController::class, 'getAllByUser']);
    Route::get('/pending', [WithdrawalController::class, 'hasPending']);
    Route::get('/balances', [WithdrawalController::class, 'getWithdrawalData']);
    Route::get('/u/{id}', [WithdrawalController::class, 'getById']);
});
