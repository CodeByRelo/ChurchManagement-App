using ChurchManagement.API.DTOs.ChurchInfo;
using ChurchManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChurchManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChurchInfoController : ControllerBase
{
    private readonly ChurchInfoService _churchInfoService;

    public ChurchInfoController(
        ChurchInfoService churchInfoService)
    {
        _churchInfoService = churchInfoService;
    }

    // GET: api/ChurchInfo
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> Get()
    {
        var churchInfo =
            await _churchInfoService.GetAsync();

        if (churchInfo == null)
        {
            return NotFound(new
            {
                message = "Church information has not been configured."
            });
        }

        return Ok(churchInfo);
    }

    // PUT: api/ChurchInfo
    [HttpPut]
    [Authorize(Roles =
        "Super Administrator,Church Administrator")]
    public async Task<IActionResult> Update(
        [FromBody] UpdateChurchInfoRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var churchInfo =
            await _churchInfoService.UpdateAsync(request);

        return Ok(churchInfo);
    }
}